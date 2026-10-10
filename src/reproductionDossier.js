// Reproduction Audit Dossier v1.7: a local snapshot of visible, self-reported research.
import {ROOM_REPO} from "./roomData.js";
import {trialsForCharter} from "./fusionTrials.js";
import {artifactsForTrial} from "./artifactData.js";
import {byteChecksForArtifact,BYTE_CHECK_RESULTS} from "./byteChecks.js";
import {reproductionsForTrial,REPRO_OUTCOMES} from "./reproductionData.js";

export const DOSSIER_KIND="bubblenest.reproduction-dossier";
export const DOSSIER_VERSION="1.7.0";
const url=n=>ROOM_REPO+"/issues/"+n;
const pick=(x,keys)=>Object.fromEntries(keys.map(k=>[k,x?.[k]??null]));
const count=(rows,key,values)=>Object.fromEntries(values.map(v=>[v,rows.filter(x=>x[key]===v).length]));
const gap=(code,message)=>({code,message});
const sort=(a,b)=>a.issueNumber-b.issueNumber;

export function buildReproductionDossier({trial,charter,proposal,bubbles=[],artifacts=[],byteChecks=[],reproductions=[],
 feedStatus="unavailable",generatedAt}={}){
 if(!trial||trial.kind!=="Attempt report"||!Number.isSafeInteger(trial.issueNumber)||trial.issueNumber<1||
  trialsForCharter([trial],charter,proposal,bubbles).length!==1)return null;
 const validArtifacts=artifactsForTrial(artifacts,trial,charter,proposal,bubbles).sort(sort);
 const validReproductions=reproductionsForTrial(reproductions,trial,charter,proposal,bubbles,validArtifacts).sort(sort);
 const sourceArtifacts=validArtifacts.map(a=>({
  ...pick(a,["issueNumber","url","date","author","kind","name","version","fileBytes","digest","digestStatus",
    "artifactURL","provenance","environment","steps","license","limitations"]),
  byte_checks:byteChecksForArtifact(byteChecks,a,trial,charter,proposal,bubbles).sort(sort)
   .map(v=>pick(v,["issueNumber","url","date","author","filename","observedBytes",
    "observedDigest","referenceDigest","referenceBytes","result","acquisition","environment","limitations"]))
 }));
 const allChecks=sourceArtifacts.flatMap(a=>a.byte_checks);
 const reports=validReproductions.map(v=>pick(v,["issueNumber","url","date","author","outcome","sameAccount",
  "artifactNumber","artifactDigest","artifactVersion","referenceOutcome","method","environment","controls",
  "observations","deviations","limitations","stopReason"]));
 const outcomes=count(reports,"outcome",REPRO_OUTCOMES),byteOutcomes=count(allChecks,"result",BYTE_CHECK_RESULTS);
 const gaps=[];
 if(feedStatus!=="ready")gaps.push(gap("FEED_NOT_READY","The GitHub feed is unavailable or still loading; public records may be absent."));
 if(!sourceArtifacts.length)gaps.push(gap("NO_ARTIFACT_RECEIPTS","No in-scope public Artifact receipts visible."));
 if(sourceArtifacts.some(a=>!a.digest))gaps.push(gap("MISSING_DECLARED_DIGEST","One or more public Artifact receipts lack a declared SHA-256."));
 if(sourceArtifacts.some(a=>!a.artifactURL))gaps.push(gap("MISSING_PUBLIC_FILE_LINK","One or more public Artifact receipts lack a public file URL."));
 if(sourceArtifacts.some(a=>!a.byte_checks.length))gaps.push(gap("NO_BYTE_CHECK_FOR_SOME_ARTIFACTS","Some visible Artifacts have no matching Byte Check receipts."));
 if(byteOutcomes.HASH_MISMATCH||byteOutcomes.DECLARED_SIZE_CONFLICT)gaps.push(gap("BYTE_CHECK_DISAGREEMENTS","A reported Byte Check conflicts with declared reference metadata."));
 if(!reports.length)gaps.push(gap("NO_REPRODUCTION_REPORTS","No scoped reproduction attempts are visible."));
 if(outcomes.REPORTED_MATCH&&outcomes.REPORTED_DIFFERENCE)gaps.push(gap("CONFLICTING_REPRODUCTION_REPORTS","Both matching and differing outcomes have been reported."));
 if(reports.some(r=>r.sameAccount))gaps.push(gap("SOURCE_ACCOUNT_REPEATED","Some reports come from the same GitHub account as the source Trial."));
 if(reports.some(r=>r.artifactNumber===null))gaps.push(gap("UNPINNED_ATTEMPTS","Some inconclusive, blocked or stopped reports cite no Artifact."));
 return {
  kind:DOSSIER_KIND,schema_version:DOSSIER_VERSION,generated_at:generatedAt||new Date().toISOString(),
  source:{
   system:"Bubble Nest public GitHub Issues",repository:ROOM_REPO,feed_status:feedStatus,
   coverage:"PARTIAL_OR_UNKNOWN",feed_limit:"At most 3 pages of 100 Issues including closed Issues",
   signed:false,independent_verification:false,execution_authorized:false,
   warnings:["Original GitHub Issues and contributor-declared hashes may be edited or fabricated.",
    "Matching declared byte checks or reproduction reports do NOT certify scientific truth, authorship, legal permissions, or reviewer independence.",
    "An absent record is not proof of absence because of bounded pagination, API outages and parser restrictions."]
  },
  provenance:{
   origin_a:pick(bubbles.find(b=>b.url===url(proposal.aNumber)),["title","author","url"]),
   origin_b:pick(bubbles.find(b=>b.url===url(proposal.bNumber)),["title","author","url"]),
   fusion:pick(proposal,["issueNumber","url","author","question","mode"]),
   charter:pick(charter,["issueNumber","url","author","objective","methods","metrics","limitations","phase"]),
   original_trial:pick(trial,["issueNumber","url","author","date","kind","finding","question","procedure",
    "observations","controls","limitations","stopNote"])
  },
  counts:{
   artifacts:sourceArtifacts.length,declared_digests:sourceArtifacts.filter(a=>!!a.digest).length,
   byte_checks:allChecks.length,byte_outcomes:byteOutcomes,
   reproduction_reports:reports.length,reproduction_outcomes:outcomes,
   same_trial_account_reports:reports.filter(r=>r.sameAccount).length
  },
  artifacts:sourceArtifacts,reproductions:reports,gaps,
  caveat:"INVENTORY_ONLY_NOT_A_VERIFICATION_SCORE_OR_AUTHORIZATION"
 };
}
const md=v=>String(v??"Not supplied").replace(/[\r\n\t]+/g," ")
 .replace(/([#*_~\x60\[\]<>|\\])/g,"\\$1").slice(0,1800);
const line=(label,value)=>"- **"+label+":** "+md(value);
export function dossierMarkdown(d){
 if(!d||d.kind!==DOSSIER_KIND)return "";
 const p=d.provenance;
 const lines=[
  "# Reproduction Audit Dossier","",
  "**INVENTORY ONLY · NOT INDEPENDENTLY VERIFIED · NOT EXECUTION AUTHORIZATION**","",
  line("Schema",d.schema_version),line("Generated",d.generated_at),
  line("Feed",d.source.feed_status),line("Coverage",d.source.coverage),"",
  "## Original source chain","",
  line("Bubble A",p.origin_a.title),line("Bubble A issue",p.origin_a.url),
  line("Bubble B",p.origin_b.title),line("Bubble B issue",p.origin_b.url),
  line("Fusion",p.fusion.url),line("Charter",p.charter.url),line("Original Trial",p.original_trial.url),
  line("Original contributor finding",p.original_trial.finding),
  line("Original observations",p.original_trial.observations),
  line("Original controls",p.original_trial.controls),"",
  "## Record counts (not scientific scores)","",
  line("Artifacts",d.counts.artifacts),line("Declared SHA-256 digests",d.counts.declared_digests),
  line("Byte Checks",d.counts.byte_checks),line("Reproduction reports",d.counts.reproduction_reports)
 ];
 for(const [k,v]of Object.entries(d.counts.reproduction_outcomes))lines.push(line(k,v));
 lines.push("","## Artifacts and byte comparisons","");
 if(!d.artifacts.length)lines.push("No in-scope Artifact records visible.","");
 for(const a of d.artifacts){
  lines.push("### Artifact #"+a.issueNumber+" · "+md(a.name),"",
   line("Issue",a.url),line("Version",a.version),line("Declared SHA-256",a.digest||"NOT SUPPLIED"),
   line("Declared public URL",a.artifactURL||"NOT SUPPLIED"),line("Limitations",a.limitations),"");
  if(!a.byte_checks.length)lines.push("No matching Byte Check visible.","");
  for(const c of a.byte_checks)lines.push(line("Byte Check #"+c.issueNumber,c.result+" · "+c.url),"");
 }
 lines.push("## Reproduction reports","");
 if(!d.reproductions.length)lines.push("No in-scope reproduction reports visible.","");
 for(const r of d.reproductions)lines.push("### Report #"+r.issueNumber+" · "+md(r.outcome),"",
   line("Issue",r.url),line("GitHub handle",r.author),
   line("Same original trial account",r.sameAccount?"Yes, account match only":"No, independence NOT verified"),
   line("Pinned artifact",r.artifactNumber?"#"+r.artifactNumber+" · "+r.artifactVersion:"Not pinned"),
   line("Observations",r.observations),line("Controls",r.controls),
   line("Deviations",r.deviations),line("Limitations",r.limitations),"");
 lines.push("## Visible gaps and disagreements","");
 if(!d.gaps.length)lines.push("No rule-based gap flagged in the bounded snapshot. Completeness is NOT established.","");
 for(const g of d.gaps)lines.push(line(g.code,g.message));
 lines.push("","## Uncertainty and governance","",...d.source.warnings.map(s=>"- "+md(s)),"",
  "**No Citation, No Coronation. Ledger Above Bruv.**","");
 return lines.join("\n");
}
export function dossierFileName(d){
 if(!d||d.kind!==DOSSIER_KIND)return "reproduction-audit";
 return "reproduction-audit-trial-"+d.provenance.original_trial.issueNumber+"-v1-7";
}
