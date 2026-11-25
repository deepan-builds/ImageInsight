const input=document.getElementById('fileInput'),drop=document.getElementById('dropzone'),preview=document.getElementById('preview'),wrap=document.getElementById('previewWrap'),analyze=document.getElementById('analyzeBtn'),error=document.getElementById('error');
const allowed=['image/jpeg','image/png','image/webp','image/gif','image/bmp'];let selected=null,last=null;
function choose(file){error.textContent='';if(!file)return;const ext=file.name.split('.').pop().toLowerCase();if(!allowed.includes(file.type)&&!['jpg','jpeg','png','webp','gif','bmp'].includes(ext)){error.textContent='Unsupported image format.';return}if(file.size>3*1024*1024){error.textContent='Please choose an image smaller than 3 MB.';return}selected=file;preview.src=URL.createObjectURL(file);document.getElementById('fileName').textContent=file.name;wrap.hidden=false;analyze.disabled=false;document.getElementById('results').hidden=true;document.getElementById('empty').hidden=false}
input.addEventListener('change',e=>choose(e.target.files[0]));
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>choose(e.dataTransfer.files[0]));
document.getElementById('removeBtn').addEventListener('click',()=>{selected=null;input.value='';preview.removeAttribute('src');wrap.hidden=true;analyze.disabled=true;error.textContent=''});
async function prepareForAI(file){
  // Gemini image input accepts JPEG, PNG and WebP. Convert GIF/BMP to PNG in-browser.
  if(['image/jpeg','image/png','image/webp'].includes(file.type)) return {base64:await toBase64(file),mimeType:file.type};
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('This image could not be decoded by your browser. Please convert it to PNG or JPEG.'));img.src=url});
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    canvas.getContext('2d').drawImage(img,0,0);
    const dataUrl=canvas.toDataURL('image/png');
    return {base64:dataUrl.split(',')[1],mimeType:'image/png'};
  }finally{URL.revokeObjectURL(url)}
}
function toBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=()=>reject(Error('Could not read image'));r.readAsDataURL(file)})}
analyze.addEventListener('click',async()=>{if(!selected)return;error.textContent='';document.getElementById('empty').hidden=true;document.getElementById('results').hidden=true;document.getElementById('loading').hidden=false;analyze.disabled=true;try{const prepared=await prepareForAI(selected);const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType:prepared.mimeType,imageBase64:prepared.base64})});const data=await response.json();if(!response.ok)throw Error(data.error||'Analysis failed');last=data;document.getElementById('textResult').textContent=data.extractedText||'No readable text detected.';document.getElementById('descriptionResult').textContent=data.imageDescription||'No description returned.';document.getElementById('loading').hidden=true;document.getElementById('results').hidden=false}catch(e){document.getElementById('loading').hidden=true;document.getElementById('empty').hidden=false;error.textContent=e.message}finally{analyze.disabled=!selected}});
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.getElementById(btn.dataset.copy).textContent);btn.textContent='Copied ✓';setTimeout(()=>btn.textContent='Copy',1200)}catch{error.textContent='Clipboard unavailable. Please copy the text manually.'}}));
document.getElementById('downloadBtn').addEventListener('click',()=>{if(!last)return;const blob=new Blob([`EXTRACTED TEXT\n${last.extractedText}\n\nIMAGE DESCRIPTION\n${last.imageDescription}`],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='imageinsight-results.txt';a.click();URL.revokeObjectURL(a.href)});
