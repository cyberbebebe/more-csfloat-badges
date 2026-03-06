const fade_gloves_purple =
  "linear-gradient(to right, #d9bba5, #e5903b, #db5977, #6775e1)";
const fade_gloves = {
  R1: {
    gradient: fade_gloves_purple,
    position: "100%",
  },
  R2: {
    gradient: fade_gloves_purple,
    position: "90%",
  },
  R3: {
    gradient: fade_gloves_purple,
    position: "80%",
  },
  T1: {
    gradient: fade_gloves_purple,
    position: "60%",
  },
  T2: {
    gradient: fade_gloves_purple,
    position: "45%",
  },
  T3: {
    gradient: fade_gloves_purple,
    position: "30%",
  },
  BTA: {
    gradient: fade_gloves_purple,
    position: "15%",
  },
  ORG: {
    gradient: "linear-gradient(to right, #e8c87a, #f0a030, #e86820, #d04010)",
    position: "100%",
  },
};

const gamma_doppler_P1_gem =
  "linear-gradient(to top right, #006622 0%, #00a859 10%, #0088ff 40%, #00bfff 75%, #00d4ff 100%)";

const gamma_doppler_P1_green =
  "linear-gradient(to top right, #1b7a27 0%, #32bd32 15%, #0088ff 40%, #00bfff 80%, #00d4ff 100%)";

const gamma_doppler_P1_purple =
  "linear-gradient(to top right, #5415a3 0%, #863bf5 15%, #0088ff 50%, #00bfff 85%, #00d4ff 100%)";
const gamma_doppler_P1 = {
  R1: {
    gradient: gamma_doppler_P1_gem,
    position: "100%",
  },
  T1: {
    gradient: gamma_doppler_P1_gem,
    position: "100%",
  },
  T2: {
    gradient: gamma_doppler_P1_gem,
    position: "80%",
  },
  T3: {
    gradient: gamma_doppler_P1_gem,
    position: "60%",
  },
  T4: {
    gradient: gamma_doppler_P1_gem,
    position: "40%",
  },
  T1_Tip: {
    gradient: gamma_doppler_P1_gem,
    position: "100%",
  },
  T2_Tip: {
    gradient: gamma_doppler_P1_gem,
    position: "80%",
  },
  T3_Tip: {
    gradient: gamma_doppler_P1_gem,
    position: "60%",
  },
  T4_Tip: {
    gradient: gamma_doppler_P1_gem,
    position: "40%",
  },
  BTA_Tip: {
    gradient: gamma_doppler_P1_gem,
    position: "25%",
  },
  T1_Green: {
    gradient: gamma_doppler_P1_green,
    position: "100%",
  },
  T2_Green: {
    gradient: gamma_doppler_P1_green,
    position: "80%",
  },
  T3_Green: {
    gradient: gamma_doppler_P1_green,
    position: "60%",
  },
  T4_Green: {
    gradient: gamma_doppler_P1_green,
    position: "40%",
  },
  BTA_Green: {
    gradient: gamma_doppler_P1_green,
    position: "20%",
  },
  T1_Purple: {
    gradient: gamma_doppler_P1_purple,
    position: "100%",
  },
  T2_Purple: {
    gradient: gamma_doppler_P1_purple,
    position: "80%",
  },
  T3_Purple: {
    gradient: gamma_doppler_P1_purple,
    position: "60%",
  },
  T4_Purple: {
    gradient: gamma_doppler_P1_purple,
    position: "40%",
  },
  BTA_Purple: {
    gradient: gamma_doppler_P1_purple,
    position: "20%",
  },
};

const gamma_doppler_P2_green =
  "linear-gradient(to right, #c8f5c8, #6dbf6d, #2e8b2e, #1a5c1a)";
const gamma_doppler_P2 = {
  T1: {
    gradient: gamma_doppler_P2_green,
    position: "100%",
  },
  T2: {
    gradient: gamma_doppler_P2_green,
    position: "80%",
  },
  T3: {
    gradient: gamma_doppler_P2_green,
    position: "60%",
  },
  T4: {
    gradient: gamma_doppler_P2_green,
    position: "40%",
  },
  BTA: {
    gradient: gamma_doppler_P2_green,
    position: "20%",
  },
};

const gamma_doppler_P3_cyan =
  "linear-gradient(to right, #3aa845, #7cdb7c, #5ce1e6, #00e5ff, #00b4d8)";
const gamma_doppler_P3 = {
  T1: {
    gradient: gamma_doppler_P3_cyan,
    position: "100%",
  },
  T2: {
    gradient: gamma_doppler_P3_cyan,
    position: "80%",
  },
  T3: {
    gradient: gamma_doppler_P3_cyan,
    position: "60%",
  },
  T4: {
    gradient: gamma_doppler_P3_cyan,
    position: "40%",
  },
  BTA: {
    gradient: gamma_doppler_P3_cyan,
    position: "20%",
  },
};

const gamma_mixed_gradients = {
  T1_Cyan: gamma_doppler_P3.T1,
  T2_Cyan: gamma_doppler_P3.T2,
  T3_Cyan: gamma_doppler_P3.T3,
  T4_Cyan: gamma_doppler_P3.T4,
  T1_Green: gamma_doppler_P2.T1,
  T2_Green: gamma_doppler_P2.T2,
  T3_Green: gamma_doppler_P2.T3,
  T4_Green: gamma_doppler_P2.T4,
};

const gamma_doppler_P4_cyan =
  "linear-gradient(to top right, #0a2e25 0%, #107563 15%, #00b3a4 40%, #00e5d8 75%, #00ffea 100%)";
const gamma_doppler_P4_lime =
  "linear-gradient(to top right, #0d2e26 0%, #157365 15%, #32c229 40%, #50cc00 75%, #80cc00 100%)";
const gamma_doppler_P4 = {
  T1_Cyan: {
    gradient: gamma_doppler_P4_cyan,
    position: "100%",
  },
  T2_Cyan: {
    gradient: gamma_doppler_P4_cyan,
    position: "80%",
  },
  T3_Cyan: {
    gradient: gamma_doppler_P4_cyan,
    position: "60%",
  },
  T4_Cyan: {
    gradient: gamma_doppler_P4_cyan,
    position: "40%",
  },
  BTA_Cyan: {
    gradient: gamma_doppler_P4_cyan,
    position: "20%",
  },
  T1_Cyan_Tip: {
    gradient: gamma_doppler_P4_cyan,
    position: "100%",
  },
  T2_Cyan_Tip: {
    gradient: gamma_doppler_P4_cyan,
    position: "80%",
  },
  T3_Cyan_Tip: {
    gradient: gamma_doppler_P4_cyan,
    position: "60%",
  },
  T4_Cyan_Tip: {
    gradient: gamma_doppler_P4_cyan,
    position: "40%",
  },
  BTA_Cyan_Tip: {
    gradient: gamma_doppler_P4_cyan,
    position: "20%",
  },
  T1_Lime: {
    gradient: gamma_doppler_P4_lime,
    position: "100%",
  },
  T2_Lime: {
    gradient: gamma_doppler_P4_lime,
    position: "80%",
  },
  T3_Lime: {
    gradient: gamma_doppler_P4_lime,
    position: "60%",
  },
  T4_Lime: {
    gradient: gamma_doppler_P4_lime,
    position: "40%",
  },
  BTA_Lime: {
    gradient: gamma_doppler_P4_lime,
    position: "20%",
  },
  T1_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "100%",
  },
  T2_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "80%",
  },
  T3_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "60%",
  },
  T4_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "40%",
  },
  BTA_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "20%",
  },
  Fake_Lime_Tip: {
    gradient: gamma_doppler_P4_lime,
    position: "20%",
  },
};

const doppler_P1_fbp =
  "linear-gradient(to top right, #db7eb4, #a37cd9, #758cf2, #5a6ee6)";
const doppler_P1_fbp_gradients = {
  T1: {
    gradient: doppler_P1_fbp,
    position: "100%",
  },
  T2: {
    gradient: doppler_P1_fbp,
    position: "80%",
  },
  T3: {
    gradient: doppler_P1_fbp,
    position: "60%",
  },
  T4: {
    gradient: doppler_P1_fbp,
    position: "40%",
  },
  BTA: {
    gradient: doppler_P1_fbp,
    position: "20%",
  },
};

const doppler_P1_blue =
  "linear-gradient(to top right, #4a3563, #586396, #4d84e6, #1ca3ff)";
const doppler_P1_pink =
  "linear-gradient(to top right, #4a3563, #874370, #d6388a, #ff47b0)";
const doppler_P1_bluepink_gradients = {
  T1_MaxBlue: {
    gradient: doppler_P1_blue,
    position: "100%",
  },
  T2_MaxBlue: {
    gradient: doppler_P1_blue,
    position: "80%",
  },
  T3_MaxBlue: {
    gradient: doppler_P1_blue,
    position: "60%",
  },
  T4_MaxBlue: {
    gradient: doppler_P1_blue,
    position: "40%",
  },
  BTA_MaxBlue: {
    gradient: doppler_P1_blue,
    position: "20%",
  },

  T1_MaxPink: {
    gradient: doppler_P1_pink,
    position: "100%",
  },
  T2_MaxPink: {
    gradient: doppler_P1_pink,
    position: "80%",
  },
  T3_MaxPink: {
    gradient: doppler_P1_pink,
    position: "60%",
  },
  T4_MaxPink: {
    gradient: doppler_P1_pink,
    position: "40%",
  },
  BTA_MaxPink: {
    gradient: doppler_P1_pink,
    position: "20%",
  },

  FI: {
    gradient: doppler_P1_pink,
    position: "50%",
  },
};

const doppler_P2_pink =
  "linear-gradient(to top right, #2e0c1f 0%, #991255 15%, #e62282 35%, #ff309c 60%, #ff4db8 80%, #ff66c4 100%)";
const doppler_P2 = {
  T1: {
    gradient: doppler_P2_pink,
    position: "100%",
  },
  T2: {
    gradient: doppler_P2_pink,
    position: "80%",
  },
  T3: {
    gradient: doppler_P2_pink,
    position: "60%",
  },
  T4: {
    gradient: doppler_P2_pink,
    position: "40%",
  },
  BTA: {
    gradient: doppler_P2_pink,
    position: "20%",
  },
};

const doppler_P3_blue =
  "linear-gradient(to top right, #273d3e 0%, #32626e 20%, #1b69d4 60%, #0048ff 100%)";
const doppler_P3_fbp =
  "linear-gradient(to top right, #2d3d3a 0%, #3b426e 20%, #4b41ad 60%, #5d36eb 100%)";
const doppler_P3 = {
  T1_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "100%",
  },
  T2_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "80%",
  },
  T3_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "60%",
  },
  T4_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "40%",
  },
  BTA_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "20%",
  },
  Fake_MaxBlue: {
    gradient: doppler_P3_blue,
    position: "20%",
  },
  T1_MaxFBP: {
    gradient: doppler_P3_fbp,
    position: "100%",
  },
  T2_MaxFBP: {
    gradient: doppler_P3_fbp,
    position: "80%",
  },
  T3_MaxFBP: {
    gradient: doppler_P3_fbp,
    position: "60%",
  },
  T4_MaxFBP: {
    gradient: doppler_P3_fbp,
    position: "40%",
  },
  BTA_MaxFBP: {
    gradient: doppler_P3_fbp,
    position: "20%",
  },
};

const doppler_P4_blue =
  "linear-gradient(to top right, #161f36 0%, #233a75 25%, #1a5be3 55%, #0088ff 80%, #1ec7ff 100%)";
const doppler_P4 = {
  T1: {
    gradient: doppler_P4_blue,
    position: "100%",
  },
  T2: {
    gradient: doppler_P4_blue,
    position: "80%",
  },
  T3: {
    gradient: doppler_P4_blue,
    position: "60%",
  },
  T4: {
    gradient: doppler_P4_blue,
    position: "40%",
  },
  BTA: {
    gradient: doppler_P4_blue,
    position: "20%",
  },
  Fake: {
    gradient: doppler_P4_blue,
    position: "50%",
  },
  T1_Tip: {
    gradient: doppler_P4_blue,
    position: "100%",
  },
  T2_Tip: {
    gradient: doppler_P4_blue,
    position: "80%",
  },
  T3_Tip: {
    gradient: doppler_P4_blue,
    position: "60%",
  },
  T4_Tip: {
    gradient: doppler_P4_blue,
    position: "40%",
  },
  BTA_Tip: {
    gradient: doppler_P4_blue,
    position: "20%",
  },
};
