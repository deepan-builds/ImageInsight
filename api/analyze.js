export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Use POST'});
 try{
  const {imageBase64,mimeType}=req.body||{};
  const allowed=['image/jpeg','image/png','image/webp'];
  if(!imageBase64||!allowed.includes(mimeType))return res.status(400).json({error:'Upload a supported JPG, PNG, WEBP, GIF or BMP image.'});
  if(imageBase64.length>4_000_000)return res.status(413).json({error:'Image is too large. Maximum size is 3 MB.'});
  const key=process.env.GEMINI_API_KEY;
  if(!key)return res.status(500).json({error:'AI is not configured. Add GEMINI_API_KEY to Vercel environment variables.'});
  const prompt='Analyze this image. Return only valid JSON with two string fields: extractedText (transcribe all readable text exactly; if none, say No readable text detected) and imageDescription (describe visible objects, scene and context accurately; do not invent details).';
  const api=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:imageBase64}}]}],generationConfig:{responseMimeType:'application/json',temperature:0.2}})});
  const result=await api.json();if(!api.ok)return res.status(502).json({error:result.error?.message||'AI provider error'});
  const output=result.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
  const parsed=JSON.parse(output);
  return res.status(200).json({extractedText:parsed.extractedText||'',imageDescription:parsed.imageDescription||''});
 }catch(e){console.error(e);return res.status(500).json({error:'Could not analyze image. Please try again.'})}
}
