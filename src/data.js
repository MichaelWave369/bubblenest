export const categories=["All","Science","Technology","Philosophy","Art","Community","Wildcards"];
export const examples=[
 {id:"demo-1",title:"Can different paths reach one endpoint yet preserve different histories?",category:"Science",summary:"Let's design experiments that distinguish terminal agreement from relational memory.",ask:"Looking for experimental design and mathematical critique.",evidence:"Open hypothesis, not a confirmed finding.",author:"Bubble Nest concept",sample:true},
 {id:"demo-2",title:"An agent-friendly collaboration commons",category:"Technology",summary:"A shared space where human and AI contributors can reason together while tracking evidence and authorship.",ask:"Seeking accessibility, governance and interface contributors.",evidence:"Design proposal; real-world testing is pending.",author:"Bubble Nest concept",sample:true},
 {id:"demo-3",title:"One sketch, a thousand interpretations",category:"Art",summary:"An open art lab where human and agent creators build variations and keep a transparent chain of attribution.",ask:"Let's design the first gallery exhibit.",evidence:"Creative concept, not a tested product.",author:"Bubble Nest concept",sample:true},
 {id:"demo-4",title:"Claim to Flame: The Sauce Trials",category:"Wildcards",summary:"Make claim checking entertaining, from weak sauce to reproducible evidence.",ask:"Invite skeptical reviewers and help shape our scoring rubric.",evidence:"Educational comedy concept; not a truth detector.",author:"Bubble Nest concept",sample:true}
];
export const stages=[
 {name:"Weak Sauce",sub:"Trust me, bruv",color:"#78cda6",min:0,max:19},
 {name:"Anecdotal Heat",sub:"A story appears",color:"#c0ce6d",min:20,max:39},
 {name:"Receipt Drizzle",sub:"Sources emerge",color:"#edbc68",min:40,max:59},
 {name:"Method Marinade",sub:"Show your methods",color:"#ff9460",min:60,max:79},
 {name:"Replication Inferno",sub:"Others can test",color:"#f46c58",min:80,max:94},
 {name:"Ledger Reaper",sub:"Fully documented",color:"#e954a3",min:95,max:100}
];
export const checks=[
 {id:"precise",label:"Claim is precise and falsifiable",weight:15},
 {id:"sources",label:"Sources or data are identified",weight:20},
 {id:"credit",label:"Dates, authorship and provenance are clear",weight:15},
 {id:"methods",label:"Repeatable steps are available",weight:20},
 {id:"limits",label:"Limitations and counterevidence are acknowledged",weight:10},
 {id:"review",label:"Someone independent has checked the result",weight:20}
];
export const score=(values)=>checks.reduce((n,x)=>n+(values[x.id]?x.weight:0),0);
export const level=(points)=>stages.find(s=>points>=s.min&&points<=s.max)||stages[0];
function section(text,heading){const tag="## "+heading+"\n";const p=text.indexOf(tag);if(p<0)return "";const rest=text.slice(p+tag.length);return rest.split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,1200);}
export function parseIssue(issue){if(issue.pull_request||!(issue.title?.startsWith("[Bubble]")||issue.body?.includes("<!-- bubblenest:bubble:v1 -->")))return null;const b=issue.body||"";return{id:"issue-"+issue.number,title:issue.title.replace(/^\[Bubble\]\s*/,""),category:section(b,"Category")||"Wildcards",summary:section(b,"The spark")||"See discussion",ask:section(b,"Collaboration request")||"Discussion welcome",evidence:section(b,"Evidence and limitations")||"Not supplied",author:issue.user?.login||"Unknown",url:issue.html_url,comments:issue.comments,sample:false};}
export function makeIssue(b){return "<!-- bubblenest:bubble:v1 -->\n\n# Bubble Nest contribution\n\n## Category\n"+b.category+"\n\n## The spark\n"+b.summary+"\n\n## Why it matters\n"+(b.why||"To explore together.")+"\n\n## Collaboration request\n"+b.ask+"\n\n## Evidence and limitations\n"+(b.evidence||"Unverified. Evidence welcome.")+"\n\n---\nPlease credit sources, distinguish ideas from findings, and collaborate respectfully.";}
