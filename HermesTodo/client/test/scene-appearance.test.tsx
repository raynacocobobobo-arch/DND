// @vitest-environment jsdom
import { cleanup,render,screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach,describe,expect,it,vi } from "vitest";

import { ContextForm } from "../src/components/ContextForm";
import { ListForm } from "../src/components/ListForm";
import { DEFAULT_SCENE_COLOR } from "../src/sceneAppearance";

const createdAt="2026-11-05T00:00:00.000Z";

afterEach(cleanup);

describe("scene and category appearance",()=>{
  it("removes color selection, keeps name and crest editable and preserves a legacy scene color",async()=>{
    const onSubmit=vi.fn();
    const user=userEvent.setup();
    render(<ListForm
      list={{
        id:"old-scene",name:"出国旅行",icon:"compass",color:"#E09890",sortOrder:0,
        sceneCount:1,taskCount:0,incompleteCount:0,createdAt,updatedAt:createdAt
      }}
      onSubmit={onSubmit} onCancel={()=>undefined} />);
    expect(screen.getByRole("dialog",{name:"编辑场景"})).toBeInTheDocument();
    expect(screen.queryByText("颜色")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button",{name:/^(金狮|百合花|罗盘|生命树|典籍|双剑|王冠|羽笔卷轴)$/})).toHaveLength(8);
    await user.clear(screen.getByLabelText("场景名称"));
    await user.type(screen.getByLabelText("场景名称"),"旅行项目");
    await user.click(screen.getByRole("button",{name:"百合花"}));
    await user.click(screen.getByRole("button",{name:"保存"}));
    expect(onSubmit).toHaveBeenCalledWith({
      name:"旅行项目",icon:"fleur",color:"#E09890"
    });
  });

  it("uses a consistent default when creating a new category without exposing a palette",async()=>{
    const onSubmit=vi.fn();
    const user=userEvent.setup();
    render(<ContextForm entityLabel="分类" onSubmit={onSubmit} onCancel={()=>undefined} />);
    expect(screen.getByRole("dialog",{name:"新建分类"})).toBeInTheDocument();
    expect(screen.queryByText("颜色")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("分类名称"),"行前准备");
    await user.click(screen.getByRole("button",{name:"创建分类"}));
    expect(onSubmit).toHaveBeenCalledWith({
      name:"行前准备",icon:"compass",color:DEFAULT_SCENE_COLOR
    });
  });

  it("keeps the original color on an existing category while editing its name",async()=>{
    const onSubmit=vi.fn();
    const user=userEvent.setup();
    render(<ContextForm entityLabel="分类" context={{
      id:"old-category",name:"旅行",icon:"fleur",color:"#C0A8C8",
      sortOrder:0,createdAt,updatedAt:createdAt,incompleteCount:0,listId:"old-scene"
    }} onSubmit={onSubmit} onCancel={()=>undefined}/>);
    await user.clear(screen.getByLabelText("分类名称"));
    await user.type(screen.getByLabelText("分类名称"),"证件");
    await user.click(screen.getByRole("button",{name:"保存"}));
    expect(onSubmit).toHaveBeenCalledWith({
      name:"证件",icon:"fleur",color:"#C0A8C8"
    });
  });
});
