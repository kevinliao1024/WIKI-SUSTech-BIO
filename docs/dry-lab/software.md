---
title: Software
heading: Whole-body Delivery Model
subtitle: Whole-body delivery modeling and the PUF website.
figures:
- title: Delivery-to-editing model
  file: 14_full_model_workflow
  panels: 1
  section: overview
  width: 1400
  height: 580
  alt: Seven process icons connect administration, tissue distribution, BBB transport, cellular expression, APOE editing, unintended editing and comparison.
  caption: Transport and expression connect the administered input to APOE editing and three unwanted-editing pathways.
  number: 1
- title: 'Dose response: editing and specificity'
  file: 01_dose_response-01
  panels: 4
  section: dose
  width: 972
  height: 716
  alt: 'Dose response: editing and specificity. APOE RNA fraction, 168 h; On-target editing rate; Off-target burden;
    Specificity index'
  caption: 'A: APOE product fractions at 168 h. B–D: on-target editing, off-target burden and specificity. Coarse
    and fine scan values are retained; thresholds are model criteria.'
  number: 4
- title: 'Dose response: exposure and feasibility'
  file: 01_dose_response-02
  panels: 4
  section: dose
  width: 972
  height: 716
  alt: 'Dose response: exposure and feasibility. Liver AUC (model units); Blood Cmax (model units); Peak brain expression;
    On-target editing rate'
  caption: 'A–C: liver exposure, peak blood concentration and peak brain expression. D: the original feasibility
    classification. All quantities use the source model units.'
  number: 5
- title: APOE product trajectories
  file: 02_trajectories_and_uncertainty-01
  panels: 2
  section: trajectories
  width: 972
  height: 428
  alt: APOE product trajectories. Dose 0.5; Dose 2
  caption: A, dose 0.5; B, dose 2.0. Both trajectories span 168 h. Fractions use the total APOE RNA pool.
  number: 6
- title: Parameter uncertainty
  file: 02_trajectories_and_uncertainty-02
  panels: 4
  section: uncertainty
  width: 972
  height: 716
  alt: Uncertainty across frozen parameter samples. APOE3-like fraction; Specificity index; LDLR-binding risk proxy;
    Off-target burden
  caption: Two hundred parameter samples for 10R-proapobec at dose 0.9 and 168 h. Shading spans the 5th–95th percentiles;
    lines mark medians and model criteria.
  number: 7
- title: Sensitivity, design, and spatial comparisons
  file: 03_sensitivity_design_spatial-01
  panels: 4
  section: comparisons
  width: 972
  height: 716
  alt: Sensitivity, design, and spatial comparisons. Local sensitivity; Design comparison at 72 h; Distance from
    vessel; Cell-type comparison
  caption: A, local sensitivity at parameter scale 1.2. B, the 72-hour design screen. C–D, archived spatial summary
    means.
  number: 8
- title: Benchmark checks B1–B4
  file: 04_benchmark_scorecard-01
  panels: 4
  section: comparisons
  width: 972
  height: 716
  alt: Benchmark checks B1–B4. B1 · PASS; B2 · PASS; B3 · PASS; B4 · PARTIAL
  caption: Teal and orange indicate the supplied target bands. Each panel uses its own numeric scale.
  number: 9
- title: Benchmark checks B5–B8
  file: 04_benchmark_scorecard-02
  panels: 4
  section: comparisons
  width: 972
  height: 716
  alt: Benchmark checks B5–B8. B5 · FAIL; B6 · PASS; B7 · PASS; B8 · PASS
  caption: The motif-ratio comparison fails its supplied criterion. B6 retains the full value, 460.937. B8 uses
    the original time-course criterion.
  number: 10
- title: Absorption states and uptake
  file: 05_module1-01
  panels: 4
  section: 05_module1
  width: 972
  height: 716
  alt: Absorption states and uptake. A_dep; A_lymph; A_blood; to_lymph
  caption: 'A: A_dep; B: A_lymph; C: A_blood; D: to_lymph.'
  number: 11
- title: Absorption fluxes
  file: 05_module1-02
  panels: 3
  section: 05_module1
  width: 972
  height: 716
  alt: Absorption fluxes. to_blood; local_loss; lymph_to_blood
  caption: 'A: to_blood; B: local_loss; C: lymph_to_blood.'
  number: 12
- title: Distribution profiles
  file: 06_module2-01
  panels: 4
  section: 06_module2
  width: 972
  height: 716
  alt: Distribution profiles. A_blood; A_liver; A_peripheral; A_brain_blood
  caption: 'A: A_blood; B: A_liver; C: A_peripheral; D: A_brain_blood.'
  number: 13
- title: Distribution and clearance
  file: 06_module2-02
  panels: 4
  section: 06_module2
  width: 972
  height: 716
  alt: Distribution and clearance. A_cleared; blood_to_liver; blood_to_peripheral; blood_to_brain
  caption: 'A: A_cleared; B: blood_to_liver; C: blood_to_peripheral; D: blood_to_brain.'
  number: 14
- title: Return and clearance fluxes
  file: 06_module2-03
  panels: 4
  section: 06_module2
  width: 972
  height: 716
  alt: Return and clearance fluxes. liver_to_blood; peripheral_to_blood; brain_to_blood; clear_blood
  caption: 'A: liver_to_blood; B: peripheral_to_blood; C: brain_to_blood; D: clear_blood.'
  number: 15
- title: Clearance fluxes
  file: 06_module2-04
  panels: 3
  section: 06_module2
  width: 972
  height: 716
  alt: Clearance fluxes. clear_liver; clear_peripheral; clear_brainblood
  caption: 'A: clear_liver; B: clear_peripheral; C: clear_brainblood.'
  number: 16
- title: Blood–brain barrier states
  file: 07_module3-01
  panels: 4
  section: 07_module3
  width: 972
  height: 716
  alt: Blood–brain barrier states. A_brain_blood; A_brain_EC; A_brain_endo; A_brain_ISF
  caption: 'A: A_brain_blood; B: A_brain_EC; C: A_brain_endo; D: A_brain_ISF.'
  number: 17
- title: Blood–brain barrier transport
  file: 07_module3-02
  panels: 4
  section: 07_module3
  width: 972
  height: 716
  alt: Blood–brain barrier transport. brainblood_to_EC; EC_to_endo; EC_to_brainblood; endo_to_ISF
  caption: 'A: brainblood_to_EC; B: EC_to_endo; C: EC_to_brainblood; D: endo_to_ISF.'
  number: 18
- title: Blood–brain barrier return and loss
  file: 07_module3-03
  panels: 3
  section: 07_module3
  width: 972
  height: 716
  alt: Blood–brain barrier return and loss. endo_to_brainblood; endo_loss; clear_ISF
  caption: 'A: endo_to_brainblood; B: endo_loss; C: clear_ISF.'
  number: 19
- title: Cellular delivery states
  file: 08_module4-01
  panels: 4
  section: 08_module4
  width: 972
  height: 716
  alt: Cellular delivery states. A_brain_ISF; A_brain_cell; A_brain_nuc; mRNA_brain
  caption: 'A: A_brain_ISF; B: A_brain_cell; C: A_brain_nuc; D: mRNA_brain.'
  number: 20
- title: Expression and delivery fluxes
  file: 08_module4-02
  panels: 4
  section: 08_module4
  width: 972
  height: 716
  alt: Expression and delivery fluxes. P_brain; ISF_to_cell; cell_to_nuc; cell_loss
  caption: 'A: P_brain; B: ISF_to_cell; C: cell_to_nuc; D: cell_loss.'
  number: 21
- title: Expression and degradation fluxes
  file: 08_module4-03
  panels: 4
  section: 08_module4
  width: 972
  height: 716
  alt: Expression and degradation fluxes. deg_v; tx; deg_m; tl
  caption: 'A: deg_v; B: tx; C: deg_m; D: tl.'
  number: 22
- title: Protein degradation
  file: 08_module4-04
  panels: 1
  section: 08_module4
  width: 540
  height: 378
  alt: Protein degradation. deg_p
  caption: 'A: deg_p.'
  number: 23
- title: APOE editing states
  file: 09_module5_states-01
  panels: 4
  section: 09_module5_states
  width: 972
  height: 716
  alt: APOE editing states. P_brain; S_APOE4; S_APOE3_like; S_APOE2_like
  caption: 'A: P_brain; B: S_APOE4; C: S_APOE3_like; D: S_APOE2_like.'
  number: 24
- title: Bystander and background states
  file: 09_module5_states-02
  panels: 4
  section: 09_module5_states
  width: 972
  height: 716
  alt: Bystander and background states. S_APOE158_only; B_local_bystander; S_puf_off; E_puf_off
  caption: 'A: S_APOE158_only; B: B_local_bystander; C: S_puf_off; D: E_puf_off.'
  number: 25
- title: Substrate and complex states
  file: 09_module5_states-03
  panels: 4
  section: 09_module5_states
  width: 972
  height: 716
  alt: Substrate and complex states. S_deaminase_bg; E_deaminase_bg; S_on; S_off
  caption: 'A: S_deaminase_bg; B: E_deaminase_bg; C: S_on; D: S_off.'
  number: 26
- title: Complex and product states
  file: 09_module5_states-04
  panels: 4
  section: 09_module5_states
  width: 972
  height: 716
  alt: Complex and product states. ES_on; ES_off; E_on; E_off
  caption: 'A: ES_on; B: ES_off; C: E_on; D: E_off.'
  number: 27
- title: Editing efficiency and specificity
  file: 10_module5_metrics-01
  panels: 4
  section: 10_module5_metrics
  width: 972
  height: 716
  alt: Editing efficiency and specificity. on_target_editing_rate; off_target_burden; specificity_index; off_target_editing_fraction
  caption: 'A: on_target_editing_rate; B: off_target_burden; C: specificity_index; D: off_target_editing_fraction.'
  number: 28
- title: APOE product fractions
  file: 10_module5_metrics-02
  panels: 4
  section: 10_module5_metrics
  width: 972
  height: 716
  alt: APOE product fractions. apoe4_fraction; apoe3_like_fraction; apoe2_like_fraction; mixed_edit_fraction
  caption: 'A: apoe4_fraction; B: apoe3_like_fraction; C: apoe2_like_fraction; D: mixed_edit_fraction.'
  number: 29
- title: Off-target burden components
  file: 10_module5_metrics-03
  panels: 3
  section: 10_module5_metrics
  width: 972
  height: 716
  alt: Off-target burden components. local_bystander_burden; puf_mismatch_burden; deaminase_background_burden
  caption: 'A: local_bystander_burden; B: puf_mismatch_burden; C: deaminase_background_burden.'
  number: 30
- title: APOE production and degradation
  file: 11_module5_fluxes_a-01
  panels: 4
  section: 11_module5_fluxes_a
  width: 972
  height: 716
  alt: APOE production and degradation. prod_apoe; deg_apoe4; deg_apoe3_like; deg_apoe2_like
  caption: 'A: prod_apoe; B: deg_apoe4; C: deg_apoe3_like; D: deg_apoe2_like.'
  number: 31
- title: Site 112 editing fluxes
  file: 11_module5_fluxes_a-02
  panels: 4
  section: 11_module5_fluxes_a
  width: 972
  height: 716
  alt: Site 112 editing fluxes. deg_apoe158_only; bind112; unbind112; edit112
  caption: 'A: deg_apoe158_only; B: bind112; C: unbind112; D: edit112.'
  number: 32
- title: Site 158 editing fluxes
  file: 11_module5_fluxes_a-03
  panels: 4
  section: 11_module5_fluxes_a
  width: 972
  height: 716
  alt: Site 158 editing fluxes. bind158; unbind158; edit158; bind158_after112
  caption: 'A: bind158; B: unbind158; C: edit158; D: bind158_after112.'
  number: 33
- title: Sequential editing flux
  file: 11_module5_fluxes_a-04
  panels: 1
  section: 11_module5_fluxes_a
  width: 540
  height: 378
  alt: Sequential editing flux. unbind158_after112
  caption: 'A: unbind158_after112.'
  number: 34
- title: Sequential editing fluxes
  file: 12_module5_fluxes_b-01
  panels: 4
  section: 12_module5_fluxes_b
  width: 972
  height: 716
  alt: Sequential editing fluxes. edit158_after112; bind112_after158; unbind112_after158; edit112_after158
  caption: 'A: edit158_after112; B: bind112_after158; C: unbind112_after158; D: edit112_after158.'
  number: 35
- title: Bystander and mismatch fluxes
  file: 12_module5_fluxes_b-02
  panels: 4
  section: 12_module5_fluxes_b
  width: 972
  height: 716
  alt: Bystander and mismatch fluxes. local_bystander; prod_puf_off; deg_puf_off; bind_puf_off
  caption: 'A: local_bystander; B: prod_puf_off; C: deg_puf_off; D: bind_puf_off.'
  number: 36
- title: Mismatch and background fluxes
  file: 12_module5_fluxes_b-03
  panels: 4
  section: 12_module5_fluxes_b
  width: 972
  height: 716
  alt: Mismatch and background fluxes. unbind_puf_off; edit_puf_off; prod_deaminase_bg; deg_deaminase_bg
  caption: 'A: unbind_puf_off; B: edit_puf_off; C: prod_deaminase_bg; D: deg_deaminase_bg.'
  number: 37
- title: Background editing flux
  file: 12_module5_fluxes_b-04
  panels: 1
  section: 12_module5_fluxes_b
  width: 540
  height: 378
  alt: Background editing flux. edit_deaminase_bg
  caption: 'A: edit_deaminase_bg.'
  number: 38
- title: Earlier model trajectories
  file: 13_legacy_notebook-01
  panels: 4
  section: 13_legacy_notebook
  width: 972
  height: 716
  alt: Legacy notebook trajectories. Legacy NB01; Legacy NB02; Legacy NB03; Legacy NB05
  caption: Four distinct trajectories from the original single-pool notebook model.
  number: 39
- title: Earlier model accumulation and parameter scan
  file: 13_legacy_notebook-02
  panels: 2
  section: 13_legacy_notebook
  width: 972
  height: 378
  alt: Legacy accumulation and parameter grid. Legacy NB06; Legacy NB07
  caption: A, accumulated editing. B, the original 20 × 20 parameter grid. These outputs belong to the earlier model.
  number: 40
figure_groups:
- id: 05_module1
  title: Absorption
  count: 2
  description: Depot and lymphatic uptake connect the administered input to circulating material.
- id: 06_module2
  title: Systemic distribution
  count: 4
  description: Tissue exchange and clearance determine the material available to the brain circulation.
- id: 07_module3
  title: Blood–brain barrier transport
  count: 3
  description: Endothelial uptake, endosomal processing and return compete with release into interstitial space.
- id: 08_module4
  title: Intracellular expression
  count: 4
  description: Cell entry and nuclear delivery precede transcription, translation and degradation.
- id: 09_module5_states
  title: RNA substrates and products
  count: 4
  description: Substrate, complex and product pools expose the states behind the editing summaries.
- id: 10_module5_metrics
  title: Editing yield and specificity
  count: 3
  description: Product fractions and unwanted-editing burdens are evaluated together.
- id: 11_module5_fluxes_a
  title: Binding and catalytic fluxes
  count: 4
  description: Production, degradation and site-specific reactions control the RNA-state transitions.
- id: 12_module5_fluxes_b
  title: Sequential and unwanted editing
  count: 4
  description: Sequential editing, bystanders, mismatched binding and background activity contribute distinct fluxes.
- id: 13_legacy_notebook
  title: Earlier model
  count: 2
  description: The original notebook uses a simplified editing scheme and is kept separate from the multisite model.
rewire_references:
- Han, W. et al. Programmable RNA base editing with a single gRNA-free enzyme. Nucleic Acids Research 50, 9580–9595
  (2022). doi:10.1093/nar/gkac713.
- Liu, S. et al. Whole-Body Disposition and Physiologically Based Pharmacokinetic Modeling of Adeno-Associated Viruses
  and the Transgene Product. Journal of Pharmaceutical Sciences 113, 141–157 (2024). doi:10.1016/j.xphs.2023.10.005.
- Wang, X., McLachlan, J., Zamore, P. D. & Hall, T. M. T. Modular recognition of RNA by a human Pumilio-homology
  domain. Cell 110, 501–512 (2002). doi:10.1016/S0092-8674(02)00873-5.
- Weisgraber, K. H., Rall, S. C., Jr. & Mahley, R. W. Human E apoprotein heterogeneity. Cysteine-arginine interchanges
  in the amino acid sequence of the apo-E isoforms. Journal of Biological Chemistry 256, 9077–9083 (1981). doi:10.1016/S0021-9258(19)52510-8.
- Grünewald, J. et al. Transcriptome-wide off-target RNA editing induced by CRISPR-guided DNA base editors. Nature
  569, 433–437 (2019). doi:10.1038/s41586-019-1161-z.
- 'Virtanen, P. et al. SciPy 1.0: fundamental algorithms for scientific computing in Python. Nature Methods 17,
  261–272 (2020). doi:10.1038/s41592-019-0686-2.'
- 'Ghaffarizadeh, A. et al. PhysiCell: An open source physics-based cell simulator for 3-D multicellular systems. PLOS Computational Biology 14, e1005991 (2018). doi:10.1371/journal.pcbi.1005991.'
- 'Ghaffarizadeh, A., Friedman, S. H. & Macklin, P. BioFVM: an efficient, parallelized diffusive transport solver for 3-D biological simulations. Bioinformatics 32, 1256–1258 (2016). doi:10.1093/bioinformatics/btv730.'
workbench_references:
- Wang, X., McLachlan, J., Zamore, P. D. & Hall, T. M. T. Modular recognition of RNA by a human Pumilio-homology
  domain. Cell 110, 501–512 (2002). doi:10.1016/S0092-8674(02)00873-5.
- Zhou, W. et al. Expanding the binding specificity for RNA recognition by a PUF domain. Nature Communications 12,
  5107 (2021). doi:10.1038/s41467-021-25433-6.
- Lin, Z. et al. Evolutionary-scale prediction of atomic-level protein structure with a language model. Science
  379, 1123–1130 (2023). doi:10.1126/science.ade2574.
- 'Hoerl, A. E. & Kennard, R. W. Ridge Regression: Biased Estimation for Nonorthogonal Problems. Technometrics 12,
  55–67 (1970). doi:10.1080/00401706.1970.10488634.'
- Zhou, H. et al. A foundation language model to decipher diverse regulation of RNAs. Genome Biology 26, 301 (2025).
  doi:10.1186/s13059-025-03752-x.
---

# Software

## Whole-body Delivery Model
