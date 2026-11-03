// Shared, token-free GitHub owner confirmation for permanent asset removal.
// The static GitHub Pages editor never receives PATs or GitHub credentials.
export const MAX_GITHUB_DELETION_REQUEST=100;
export function openGithubAssetDeletion(rawIds){
 const ids=[...new Set(rawIds)].filter(id=>
  /^(?:pirates|cliffy_coast|coastal_tree)_[a-z0-9_]+$/.test(id));
 if(!ids.length)throw Error('所选素材没有对应的 GitHub 模型文件');
 const batch=ids.slice(0,MAX_GITHUB_DELETION_REQUEST);
 const body=['DND_ASSET_DELETE_V1',...batch].join('\n');
 const href='https://github.com/raynacocobobobo-arch/DND/issues/new?title='+
  encodeURIComponent('[DND-ASSET-DELETE]')+'&body='+encodeURIComponent(body);
 // Using a real anchor with rel=noopener prevents opener access and avoids
 // window.open(...,'noopener') returning null even when a tab was created.
 const anchor=document.createElement('a');
 anchor.href=href;anchor.target='_blank';anchor.rel='noopener noreferrer';
 document.body.append(anchor);anchor.click();anchor.remove();
 return {count:batch.length,remaining:ids.length-batch.length};
}
