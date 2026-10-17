---
title: Experiments
subtitle: Methods behind the work.
eyebrow: Wet Lab
protocol_groups:
- code: M
  title: Molecular Biology
  family: Core methods
  description: From DNA assembly to RNA and protein readouts.
  color: '#3d409b'
  protocols:
  - id: M01
    title: PCR
    version: '1.6'
    file: experiments/pdf/M01_PCR.pdf
    size_kb: 51
    sha256: 8489f72ce10f5249a20ce385e48c20afb412beeb0d4fa65c7a5f23cbc89cd641
  - id: M02
    title: Agarose Gel Electrophoresis and Gel Extraction
    version: '1.4'
    file: experiments/pdf/M02_Agarose_Gel_Electrophoresis_and_Gel_Extraction.pdf
    size_kb: 9913
    sha256: 3fca5545e5bd83353c6b5ebb3f4bac4636afeae010f0bff4e6e88e0e3ca55d0b
  - id: M03
    title: Restriction Enzyme Digestion
    version: '1.1'
    file: experiments/pdf/M03_Restriction_Enzyme_Digestion.pdf
    size_kb: 56
    sha256: c8840e7c0c3bee43c9cdb0b0b22e6bd7781e2744ec178518efe077a433873f3c
  - id: M04
    title: Homologous Recombination
    version: '1.2'
    file: experiments/pdf/M04_Homologous_Recombination.pdf
    size_kb: 49
    sha256: a10d5510fa85005449bc919600a175756e31d177cd2a06ad65b73afac9f721ce
  - id: M05
    title: Transformation & Plating
    version: '1.1'
    file: experiments/pdf/M05_Transformation_and_Plating.pdf
    size_kb: 79
    sha256: dadb3f78ee1e5089798ea8b0ddc35c413bfbb0da4c9fb53c4e5debdaa4cd843e
  - id: M06
    title: Colony Picking & Bacterial Culture
    version: '1.1'
    file: experiments/pdf/M06_Colony_Picking_and_Bacterial_Culture.pdf
    size_kb: 45
    sha256: 6e8f5c7d6fc7692ac4168909f5b9a37ac0a54b5ebdb92450a30f13688b78ae90
  - id: M07
    title: Plasmid Extraction
    version: '1.1'
    file: experiments/pdf/M07_Plasmid_Extraction.pdf
    size_kb: 42
    sha256: b28f9c427280f6c8cd322cb7841f62b046e69f886320a10ed2431dc751449d89
  - id: M08
    title: RNA Extraction Using a Kit
    version: '1.1'
    file: experiments/pdf/M08_RNA_Extraction_Using_Vazyme_RC112.pdf
    size_kb: 43
    sha256: a9f92db4831b29ddac735f3a859e4db87ab3536192c635acc34cd95cc29625d4
  - id: M09
    title: Automated RNA Extraction
    version: '1.1'
    file: experiments/pdf/M09_Automated_RNA_Extraction.pdf
    size_kb: 47
    sha256: e32be7a5b67470f167bcb2d11df75a0fc1afaad3bd17aec56b3cd975c176a7ef
  - id: M10
    title: Reverse Transcription
    version: '1.1'
    file: experiments/pdf/M10_Reverse_Transcription.pdf
    size_kb: 42
    sha256: b01badc53e7bdb0dc4524f505c958b03dccc2d34febb12d8c721baf51ef3e37d
  - id: M11
    title: SYBR Green qPCR
    version: '1.3'
    file: experiments/pdf/M11_SYBR_Green_qPCR.pdf
    size_kb: 48
    sha256: 3b8d4ac760d6bc2c29033e07499a473f8068ec6236b132d12130694491f48b9c
  - id: M12
    title: Western Blotting
    version: '1.1'
    file: experiments/pdf/M12_Western_Blotting.pdf
    size_kb: 79
    sha256: a12c60ec34f851c8c2d2457ad89582b95bc3d322ce1707a9c4d4d87d1b470a04
  - id: M13
    title: DNA Ligation Using T4 DNA Ligase
    version: '1.1'
    file: experiments/pdf/M13_DNA_Ligation_Using_T4_DNA_Ligase.pdf
    size_kb: 77
    sha256: 008d681e7529fb4c9f5ff09e2b7b5536ce0cecafba40e0a5357b21f0b01d6545
- code: C
  title: Cell Culture
  family: Core methods
  description: Maintain, preserve and prepare mammalian cells.
  color: '#6f71c1'
  protocols:
  - id: C01
    title: Cell Passaging
    version: '1.1'
    file: experiments/pdf/C01_Cell_Passaging.pdf
    size_kb: 46
    sha256: 509b20f0c02ff8f30564be322d77d5f796d6159cae90e4e540d94113d41c7cf4
  - id: C02
    title: Cell Cryopreservation
    version: '1.3'
    file: experiments/pdf/C02_Cell_Cryopreservation.pdf
    size_kb: 49
    sha256: be9a459bedaa95204c59fc901046a7698cef14598751ff3d38d6eedc499584ee
  - id: C03
    title: Cell Thawing
    version: '1.1'
    file: experiments/pdf/C03_Cell_Thawing.pdf
    size_kb: 45
    sha256: 6007c2d48dededa4f92b30b24708e1839cebd7ead3eb7d282b36ac4e8b17ff86
  - id: C04
    title: Cell Seeding & Transfection
    version: '1.1'
    file: experiments/pdf/C04_Cell_Seeding_and_Transfection.pdf
    size_kb: 83
    sha256: d3304fd6ea2ae68cd0f60f476afcc5031161174f9404639d77b8392507377b3c
- code: MX
  title: Integrated Molecular Biology
  family: Integrated workflows
  description: Connect core methods into complete experimental workflows.
  color: '#5f62cd'
  protocols:
  - id: MX01
    title: Site Directed Mutagenesis by Whole Plasmid PCR
    version: '1.1'
    file: experiments/pdf/MX01_Site_Directed_Mutagenesis_by_Whole_Plasmid_PCR.pdf
    size_kb: 87
    sha256: 631d246239b9fa17b76c31e64b0685af1d656f4bd4eeed1bd927d9e8aba3d558
  - id: MX02
    title: Target Transcript RT-PCR and Sequencing Readout
    version: '1.2'
    file: experiments/pdf/MX02_Target_Transcript_RT_PCR_and_Sequencing_Readout.pdf
    size_kb: 87
    sha256: 16482f4d4679648366a34f2c7553c748a9ec382f56e735b2adf684e8a07946f3
- code: MR
  title: MRE / miRNA Regulation
  family: Project methods
  description: Small-RNA extraction, detection and mimic delivery.
  color: '#676a9f'
  protocols:
  - id: MR01
    title: TRIzol-based RNA Extraction for miRNA Retention
    version: '1.2'
    file: experiments/pdf/MR01_TRIzol_RNA_Extraction_for_miRNA_Retention.pdf
    size_kb: 48
    sha256: 1f20ec7b9ecad99ec6c0ebc6db6c73618d28f1f87e24de73026b454cfb1f7fff
  - id: MR02
    title: Stem-loop RT-qPCR for miRNA Detection
    version: '1.0'
    file: experiments/pdf/MR02_Stem_loop_RT_qPCR_for_miRNA_Detection.pdf
    size_kb: 88
    sha256: a94873d244ae9081d588336a03001debbdbedfcd14db87991d2d86a7ce8880a1
  - id: MR03
    title: miRNA Mimic Transfection
    version: '1.1'
    file: experiments/pdf/MR03_miRNA_Transfection.pdf
    size_kb: 47
    sha256: 3391fe7d5370850e227e8e5d94e4a5113b25ef44b285b45e479c63e4852303e2
- code: RP
  title: Reporter System
  family: Project methods
  description: Construct, stabilize and measure the SONAR reporter.
  color: '#a45e73'
  protocols:
  - id: RP01
    title: Custom Oligo Design for Target-Site Recognition Window
    version: '1.0'
    file: experiments/pdf/RP01_Custom_Oligo_Design_for_Target_Site_Recognition_Window.pdf
    size_kb: 49
    sha256: d247d916da6bc55831ac3ad18d37f9aaf479cd4841e362f3ebdab1b7864f7fae
  - id: RP02
    title: Target Reporter Construction by Golden Gate Assembly
    version: '1.0'
    file: experiments/pdf/RP02_Target_Reporter_Construction_by_Golden_Gate_Assembly.pdf
    size_kb: 50
    sha256: 1a7bd2cc7f3e478de85eda387fe87e563f608b08852ff16a055e7143e98a8f7b
  - id: RP03
    title: TMP Treatment and Reporter Stabilization Assay
    version: '1.0'
    file: experiments/pdf/RP03_TMP_Treatment_and_Reporter_Stabilization_Assay.pdf
    size_kb: 51
    sha256: 2cdeee19b1a68320fd2a626ce4ef2258192aae39e972a2ac29683c18933e5329
  - id: RP04
    title: Fluorescence Microscopy Imaging
    version: '1.1'
    file: experiments/pdf/RP04_Fluorescence_Microscopy_Imaging.pdf
    size_kb: 47
    sha256: 2f64fa8daf8adcca7e0bb9073695f1abc4d0e7eebf85730800ed090970fe7886
  - id: RP05
    title: Fluorescence Measurement Using a Microplate Reader
    version: '1.1'
    file: experiments/pdf/RP05_Fluorescence_Measurement_Using_a_Microplate_Reader.pdf
    size_kb: 313
    sha256: 772d050998cbc6fd42990429a228c68cc10bc5f41f53ecfdb8152fa438c9ca6a
  - id: RP06
    title: Flow Cytometry Measurement
    version: '1.1'
    file: experiments/pdf/RP06_Flow_Cytometry_Measurement.pdf
    size_kb: 1179
    sha256: 11dcc723580b2efe1666042ba5737624ea5572eeaa189078c4433d68e988e880
- code: AS
  title: ASO Control
  family: Project methods
  description: Deliver antisense oligonucleotides for experimental control.
  color: '#8e608b'
  protocols:
  - id: AS01
    title: ASO Treatment
    version: '1.1'
    file: experiments/pdf/AS01_ASO_Treatment.pdf
    size_kb: 46
    sha256: 9c9ba3154fbdc0bcbdab76825290ca5756977db38af802de80a337bd2e0feee5
- code: AA
  title: AAV Delivery
  family: Project methods
  description: Packaging, purification, genome titration and transduction.
  color: '#527c8f'
  protocols:
  - id: AA01
    title: Co-transfection for AAV Packaging
    version: '1.2'
    file: experiments/pdf/AA01_AAV_Co_transfection.pdf
    size_kb: 49
    sha256: ba41c2f7ba4ad7d3b60c0b2e347f53e660baab745821b59423a9f655191943c8
  - id: AA02
    title: AAV Harvest and Purification
    version: '1.0'
    file: experiments/pdf/AA02_AAV_Harvest_and_Purification.pdf
    size_kb: 45
    sha256: bb24f5a4a619e22393f80cd75e03ae407feb0edf95494fdb6e1cb3c3e68805ae
  - id: AA03
    title: AAV Titer Quantification
    version: '1.0'
    file: experiments/pdf/AA03_AAV_Titer_Quantification.pdf
    size_kb: 50
    sha256: 6cc3829c7aec33fc5ca69575c6ce0f2839c409a18e8edc72cc72d34fc0a06a54
  - id: AA04
    title: AAV Transduction
    version: '1.0'
    file: experiments/pdf/AA04_AAV_Transduction.pdf
    size_kb: 45
    sha256: c8afb4df2cfe3bde3d604ac584cf0a4735973dadebc82ca210ba668ca658c9b8
- code: FV
  title: Functional Validation
  family: Project methods
  description: Cell delivery, lipid imaging and an Aβ42 clearance assay.
  color: '#66745c'
  protocols:
  - id: FV01
    title: Neon Electroporation Transfection
    version: '1.1'
    file: experiments/pdf/FV01_Neon_Electroporation_Transfection.pdf
    size_kb: 44
    sha256: cc27ee60f09efc4844be159947d6ecbda9cd4487195fd6251f74537f0f33b716
  - id: FV02
    title: BODIPY Lipid Staining and Confocal Imaging
    version: '1.0'
    file: experiments/pdf/FV02_BODIPY_Staining_Mounting_and_Confocal_Imaging.pdf
    size_kb: 54
    sha256: 915dbf9b2a1a4c15ea4dea93ff23fd79c4c4ad75ff9c531edf294535cd8a79ed
  - id: FV03
    title: Aβ42 Uptake Assay with ELISA Quantification
    version: '1.0'
    file: experiments/pdf/FV03_Abeta42_Uptake_Assay_with_ELISA_Quantification.pdf
    size_kb: 87
    sha256: 89cf4524a02627a70b6165ce354f5d09446e1baff6147d401b96a4a6259253da
---

## Methods behind the work.

Explore the protocols behind ORCA, from everyday laboratory methods to project-specific workflows. Each numbered protocol opens as a PDF with its materials, procedures and references.
