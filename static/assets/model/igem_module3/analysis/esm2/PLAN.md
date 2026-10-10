# ESM-2 exploratory comparison: frozen plan

Written before extracting embeddings or inspecting their cluster assignments.

## Scope

Use the existing ESM-2 `facebook/esm2_t12_35M_UR50D` weights on the 11 sequence-audited constructs in the supplied CP study. No new sequences, labels, AF3 runs or wet-lab observations are introduced. The source identifier `g27dm130g` keeps its original name but its sequence uses the observed G27D + W130G changes. Exclude that construct from activity-label comparisons. Missing activities remain missing.

## Fixed representation and analysis

1. CPU inference, float32, evaluation mode, no gradients, two threads, one sequence per batch. Use all 199 amino acids, with no truncation.
2. Primary representation: mean of final-layer residue embeddings, excluding special tokens. Retain the mean of layer 6 only as a predeclared representation-sensitivity check.
3. Use cosine distance and average-linkage agglomerative clustering for both embedding representations. Select k from {2, 3, 4} by silhouette score in the full embedding distance matrix. Ties prefer smaller k.
4. Controls: repeat the same distance/linkage/selection rule using aligned sequence Hamming distance. Compare partitions to the frozen CP spectral result with ARI.
5. Show cosine-distance heatmaps and a PCA display if useful. PCA coordinates are a display only, never used to select or evaluate clusters.
6. Report cluster sizes, singletons, full-space silhouette, T31A/T31D grouping and leave-one-construct-out partition agreement against the corresponding full-data partition. Fix baseline k for that sensitivity check; this is sensitivity to membership, not biological replication.
7. Do not optimize layers, pooling, k ranges or clustering methods against activity values. No predictive accuracy or statistical significance is estimated from seven eligible activity labels.

## Inclusion decision

Include a compact supplementary result if it clarifies representation dependence or provides a reproducible contrast with CP clustering. A visually attractive projection alone is insufficient. Main-text biological claims remain grounded in the supplied assay tables. Any apparent functional separation must be described as exploratory and require independent validation.

## Resources and provenance

Local model weights are reused read-only; no model download or fine-tuning. Packages are installed only in this task's isolated `work/esm-deps` directory following explicit user approval. Save software versions, model file hashes, sequence hashes, embeddings and full distance matrices. Refuse to overwrite outputs.
