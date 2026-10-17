// Navigation cues drawn only from the original title, never outcome claims.
// Keep the full source title alongside these cues (including failed / attempted).
const activities = [
  [/\b(?:reconstruction|construction|assembly|insertion|ligation|mutagenesis|removal)\b/i, 'Construction'],
  [/\b(?:co-?transfection|cotransfection|transfection)\b/i, 'Transfection'],
  [/\belectroporation\b/i, 'Electroporation'],
  [/\btransduction\b/i, 'Transduction'],
  [/\b(?:retransformation|transformation)\b/i, 'Transformation'],
  [/\b(?:cultures?|expansion|seeding|reactivation|maintenance|medium replacement|medium change|thawing|passaging|confluence check)\b/i, 'Cell & culture work'],
  [/\b(?:plasmid extraction|extraction|harvest|collection|storage|rna preparation|rna processing|plasmid preparation|sample preparation|amplicon preparation)\b/i, 'Sample preparation'],
  [/\b(?:reverse transcription|rt preparation)\b/i, 'Reverse transcription'],
  [/\b(?:rt-qpcr|qpcr|quantification)\b/i, 'Quantification'],
  [/\bpcr\b/i, 'PCR'],
  [/\bamplification\b/i, 'Amplification'],
  [/\b(?:sequencing|sanger|nanopore|amplicon submission)\b/i, 'Sequencing'],
  [/\bflow cytometry\b/i, 'Flow cytometry'],
  [/\b(?:fluorescence|confocal|imaging|observation)\b/i, 'Imaging & observation'],
  [/\b(?:western blot|his-tag detection)\b/i, 'Western blot'],
  [/\bstaining\b/i, 'Staining'],
  [/\belisa\b/i, 'ELISA'],
  [/\b(?:planning|design|review|orders)\b/i, 'Design & review'],
  [/\b(?:screening|(?<!functional-)screen|selection)\b/i, 'Screening'],
  [/\b(?:result receipt|receipt|provided|recovery)\b/i, 'Receipt & recovery'],
  [/\b(?:treatment|exposure)\b/i, 'Treatment'],
  [/\b(?:expression|detection|readout)\b/i, 'Measurement'],
  [/\bsubmission\b/i, 'Submission'],
];

export function recordActivities(title) {
  return activities.flatMap(([pattern,label]) => {
    const match=pattern.exec(title);
    return match ? [{label,position:match.index}] : [];
  }).sort((a,b)=>a.position-b.position).slice(0,1).map(item=>item.label);
}
