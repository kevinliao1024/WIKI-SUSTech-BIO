# ESM-2 comparison: useful as a limitation check

The completed, predeclared comparison does not justify adding an embedding-clustering success claim to the main wiki. ESM-2's final-layer mean representation isolates E72A and groups the other ten constructs together. It still groups T31A with T31D. E72A has no matched measured activity in this package, so its separation cannot establish functional prediction.

## Executed analysis

We reused the local `facebook/esm2_t12_35M_UR50D` weights and reconstructed the 11 sequences from the supplied reference plus sequence-audited mutations. Each sequence is 199 residues long. Inference ran in float32 on CPU with two threads, no gradients and no network access. Residue embeddings were averaged after excluding special tokens. The frozen [plan](PLAN.md) specified layer 12 as the primary representation, layer 6 as a sensitivity check, cosine distance, average linkage and k ∈ {2, 3, 4} selected by full-space silhouette. Aligned sequence Hamming distance was a baseline.

| Representation | Selected groups | Sizes | Silhouette in its own full space | ARI against CP partition | T31A/T31D together? | Mean leave-one-out ARI |
|---|---:|---|---:|---:|---|---:|
| ESM-2 layer 12, primary | 2 | 10 + 1 | 0.4652 | −0.1198 | Yes | 0.8081 |
| ESM-2 layer 6, sensitivity | 2 | 8 + 3 | 0.3216 | 0.6438 | Yes | 0.7774 |
| Sequence Hamming distance | 2 | 10 + 1 | 0.4158 | 0.2096 | Yes | 0.9091 |

Silhouettes in different feature spaces are not a leaderboard for biological usefulness. Leave-one-out ARI compares the refitted partition with the full-data partition restricted to the retained ten constructs, using fixed baseline k. It measures sensitivity to membership, not independent replication or predictive performance.

## Interpretation

- The final layer's singleton is **E72A**. Its other ten constructs include both T31A and T31D.
- Layer 6 groups **G27T–K30H–Q58M, N57W and N57A** together, with the other eight in a second group. The ARI between layer-6 and layer-12 partitions is −0.1079, demonstrating representation dependence in this small set.
- The Hamming baseline isolates the **triple mutant**, illustrating how grouping can reflect sequence differences without revealing function.
- The CP partition and ESM partition capture different aspects of these near-identical sequences and predicted structures. Neither establishes held-out prediction of editing activity.
- Seven usable activity annotations are insufficient to tune many embedding choices and then claim validation on the same set. No activity values were used to select the representations or clusters.

**Editorial decision:** retain the full result as a supporting analysis and summarize its limits briefly in the main wiki. A future predictive study would require a broader, independently measured sequence set and a held-out evaluation plan.

## Files and reproduction

- [Summary](results/summary.csv), [all k scores](results/k_scan.csv), [cluster labels](results/labels.csv), [leave-one-out records](results/leave_one_out.csv).
- [Sequences](results/sequences.fasta), [embeddings](results/embeddings.npz), [model and software provenance](results/provenance.json).
- [Analysis script](../../scripts/compare_esm2.py), [isolated-environment requirements](requirements.txt).

```bash
OPENBLAS_NUM_THREADS=2 OMP_NUM_THREADS=2 TOKENIZERS_PARALLELISM=false \
python scripts/compare_esm2.py --model /path/to/local/esm2_t12_35M_UR50D \
  --output work/esm2-reproduction
```

The model directory must contain the model weights, configuration and tokenizer files. Weights are not redistributed in this repository. Their SHA-256 hashes are recorded. The script refuses an existing output directory.

Source: [official ESM repository](https://github.com/facebookresearch/esm); Lin et al., *Science* (2023), [doi:10.1126/science.ade2574](https://doi.org/10.1126/science.ade2574).
