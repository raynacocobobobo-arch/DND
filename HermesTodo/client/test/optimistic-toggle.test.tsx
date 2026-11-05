// @vitest-environment jsdom
import { afterEach,describe,expect,it,vi } from "vitest";
import { act,renderHook,waitFor } from "@testing-library/react";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useToggleTask, type TaskRecord } from "../src/hooks/useTasks";

function baseTask(id:string):TaskRecord {
  return {
    id,title:"检查账单",notes:"",priority:"medium",
    dueAt:null,isCompleted:false,completedAt:null,contextId:null,
    parentTaskId:null,repeatInterval:"none",repeatRule:"",
    createdAt:"2026-11-05T01:00:00Z",updatedAt:"2026-11-05T01:00:00Z",
    subtasks:[]
  };
}
function harness(){
  const client=new QueryClient({defaultOptions:{
    queries:{retry:false,refetchOnWindowFocus:false},
    mutations:{retry:false}
  }});
  const key=["tasks",{scope:"inbox"}];
  client.setQueryData(key,[baseTask("one"),baseTask("two")]);
  function Wrapper({children}:{children:ReactNode}){
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return {client,key,Wrapper};
}
function current(client:QueryClient,key:readonly unknown[],id:string):TaskRecord{
  return (client.getQueryData<TaskRecord[]>(key)??[]).find(item=>item.id===id)!;
}
afterEach(()=>vi.unstubAllGlobals());

describe("instant optimistic completion",()=>{
  it("updates the checkbox in cache before a slow server response, then reconciles",async()=>{
    const {client,key,Wrapper}=harness();
    let finish!: (response:Response)=>void;
    const network=vi.fn(async()=>{
      return await new Promise<Response>(resolve=>{finish=resolve;});
    });
    vi.stubGlobal("fetch",network);
    const {result}=renderHook(()=>useToggleTask(),{wrapper:Wrapper});
    act(()=>result.current.mutate("one"));
    await waitFor(()=>expect(current(client,key,"one").isCompleted).toBe(true));
    expect(current(client,key,"two").isCompleted).toBe(false);
    expect(network).toHaveBeenCalledTimes(1);
    finish(new Response(JSON.stringify({
      id:"one",isCompleted:true,completedAt:"2026-11-05T03:00:00.000Z"
    }),{status:200,headers:{"content-type":"application/json"}}));
    await waitFor(()=>expect(current(client,key,"one").completedAt)
      .toBe("2026-11-05T03:00:00.000Z"));
  });

  it("rolls back this checkbox on a failed save, retaining other task changes",async()=>{
    const {client,key,Wrapper}=harness();
    let finish!: (response:Response)=>void;
    vi.stubGlobal("fetch",vi.fn(async()=>await new Promise<Response>(resolve=>{finish=resolve;})));
    const {result}=renderHook(()=>useToggleTask(),{wrapper:Wrapper});
    act(()=>result.current.mutate("one"));
    await waitFor(()=>expect(current(client,key,"one").isCompleted).toBe(true));
    // Other task may have been edited during the first pending request.
    client.setQueryData<TaskRecord[]>(key,rows=>rows?.map(item=>
      item.id==="two"?{...item,title:"另一项新内容"}:item));
    finish(new Response(JSON.stringify({error:{message:"保存失败"}}),
      {status:503,headers:{"content-type":"application/json"}}));
    await waitFor(()=>expect(current(client,key,"one").isCompleted).toBe(false));
    expect(current(client,key,"two").title).toBe("另一项新内容");
  });

  it("coalesces duplicate taps on one task but permits another task to sync",async()=>{
    const {client,key,Wrapper}=harness();
    const pendings:Record<string,Array<(response:Response)=>void>>={};
    const network=vi.fn(async(input:string|URL|Request)=>{
      const id=String(input).split("/")[3];
      return await new Promise<Response>(resolve=>(pendings[id]??=[]).push(resolve));
    });
    vi.stubGlobal("fetch",network);
    const {result}=renderHook(()=>useToggleTask(),{wrapper:Wrapper});
    act(()=>{
      result.current.mutate("one");
      result.current.mutate("one");
    });
    await waitFor(()=>expect(current(client,key,"one").isCompleted).toBe(true));
    await waitFor(()=>expect(network).toHaveBeenCalledTimes(1));
    act(()=>result.current.mutate("two"));
    await waitFor(()=>expect(current(client,key,"two").isCompleted).toBe(true));
    expect(network).toHaveBeenCalledTimes(2);
    pendings.one[0](new Response(JSON.stringify({id:"one",isCompleted:true,completedAt:null}),{
      status:200,headers:{"content-type":"application/json"}
    }));
    pendings.two[0](new Response(JSON.stringify({id:"two",isCompleted:true,completedAt:null}),{
      status:200,headers:{"content-type":"application/json"}
    }));
    await waitFor(()=>expect(result.current.isPending).toBe(false));
  });
});
