// payloadFactory.js  — Vanilla JS + JSDoc (no TypeScript)

/**
 * @typedef {Object} ImageSection
 * @property {string=} m_kcd_photo
 * @property {string=} m_kcd_iddocimage
 * @property {string=} m_kcd_adddocimage
 * @property {string=} m_kcd_sign
 * @property {string=} m_kcd_photo_gur
 * @property {string=} m_kcd_iddocimage_gur
 * @property {string=} m_kcd_adddocimage_gur
 * @property {string=} m_kcd_sign_gur
 */

/**
 * @typedef {Object} BuildInput
 * @property {Object=} custobj
 * @property {Object=} custgurobj
 * @property {Object=} addobj_P
 * @property {Object=} addobj_C
 * @property {Object=} addobj_O
 * @property {Object=} addobjgur_P
 * @property {Object=} addobjgur_C
 * @property {Object=} addobjgur_O
 * @property {Object=} kyccomobj
 * @property {Object=} kyccomgurobj
 * @property {Object=} kyccompdtlrobj
 * @property {Object=} kyccompdtlrgurobj
 * @property {Object=} acmst_obj
 * @property {Object=} accdtl_obj
 * @property {Object=} docdtl_obj
 * @property {Object=} acnomobj
 * @property {Object=} acopn_hdr_obj
 * @property {Object=} acopn_tlr_obj
 * @property {Object[]=} custobj_const
 * @property {Object[]=} custobj_join
 * @property {Object[]=} custadd_const_P_obj
 * @property {Object[]=} custadd_const_C_obj
 * @property {Object[]=} custadd_join_P_obj
 * @property {Object[]=} custadd_join_C_obj
 * @property {Object[]=} kyc1_const_input
 * @property {Object[]=} kyc2_const_input
 * @property {Object[]=} kyc1_join_input
 * @property {Object[]=} kyc2_join_input
 * @property {ImageSection=} images
 * @property {Object=} process_img_req
 */

/**
 * @typedef {'CURRENT'|'JOINT'|'MINOR'|'MINOR_WITH_EXISTING'|'FD'|'RD'|'RP'|'PIGMI'|'PROCESS_IMAGES'} AccountType
 */

/**
 * @typedef {Object} BuildOptions
 * @property {Partial<BuildInput>=} defaults   // default objects merged in
 * @property {boolean=} strict                 // throw on missing required sections (default true)
 * @property {boolean=} compact                // strip empty/undefined (default true)
 * @property {'const'|'join'=} preferJointVariant  // when both provided, which naming to prefer (default 'const')
 */

const ARRAY_SECTIONS = new Set([
  "custobj_const",
  "custobj_join",
  "custadd_const_P_obj",
  "custadd_const_C_obj",
  "custadd_join_P_obj",
  "custadd_join_C_obj",
  "kyc1_const_input",
  "kyc2_const_input",
  "kyc1_join_input",
  "kyc2_join_input",
]);

/** @type {Record<AccountType, string[]>} */
const REQUIRED_SECTIONS = {
  CURRENT: [
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  JOINT: [
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
    // joint arrays are optional but supported
  ],
  MINOR: [
    "custobj", "custgurobj",
    "addobj_P", "addobj_C", "addobj_O",
    "addobjgur_P", "addobjgur_C", "addobjgur_O",
    "kyccomobj", "kyccomgurobj", "kyccompdtlrobj", "kyccompdtlrgurobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  MINOR_WITH_EXISTING: [
    "custobj",
    "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  FD: [
    "acopn_hdr_obj", "acopn_tlr_obj",
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  RD: [
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  RP: [
    "acopn_hdr_obj", "acopn_tlr_obj",
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  PIGMI: [
    "custobj", "addobj_P", "addobj_C", "addobj_O",
    "kyccomobj", "kyccompdtlrobj",
    "acmst_obj", "accdtl_obj", "docdtl_obj", "acnomobj", "images",
  ],
  PROCESS_IMAGES: [
    "process_img_req",
  ],
};

function deepMerge(base, override) {
  if (Array.isArray(base) && Array.isArray(override)) {
    return override.filter(v => v !== undefined);
  }
  if (isObject(base) && isObject(override)) {
    const out = { ...base };
    for (const k of Object.keys(override)) {
      const v = override[k];
      if (v === undefined) continue;
      if (Array.isArray(v)) {
        out[k] = v;
      } else if (isObject(v) && isObject(out[k]) && !Array.isArray(v)) {
        out[k] = deepMerge(out[k], v);
      } else {
        out[k] = v;
      }
    }
    for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
    return out;
  }
  return override ?? base;
}

function compact(obj) {
  if (!isObject(obj) && !Array.isArray(obj)) return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v)) {
      out[k] = v.map(x => (isObject(x) || Array.isArray(x) ? compact(x) : x));
    } else if (isObject(v)) {
      const c = compact(v);
      if (isEmptyObject(c)) continue;
      out[k] = c;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function isObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}
function isEmptyObject(o) {
  return isObject(o) && Object.keys(o).length === 0;
}

/**
 * @param {AccountType} type
 * @param {BuildInput} data
 * @param {BuildOptions=} opts
 * @returns {Object}
 */
function buildPayload(type, data, opts) {
  const options = Object.assign(
    { strict: true, compact: true, preferJointVariant: "const", defaults: {} },
    opts || {}
  );

  const required = REQUIRED_SECTIONS[type] || [];
  const out = {};

  // helper: pick either *_const or *_join arrays based on preferJointVariant
  const choose = (constArr, joinArr) => {
    return options.preferJointVariant === "join" ? (joinArr ?? constArr) : (constArr ?? joinArr);
  };

  // JOINT-specific arrays (optional)
  if (type === "JOINT") {
    const custArr = choose(data.custobj_const, data.custobj_join);
    if (custArr) out[data.custobj_const ? "custobj_const" : "custobj_join"] = custArr;

    const addP = choose(data.custadd_const_P_obj, data.custadd_join_P_obj);
    if (addP) out[addP === data.custadd_const_P_obj ? "custadd_const_P_obj" : "custadd_join_P_obj"] = addP;

    const addC = choose(data.custadd_const_C_obj, data.custadd_join_C_obj);
    if (addC) out[addC === data.custadd_const_C_obj ? "custadd_const_C_obj" : "custadd_join_C_obj"] = addC;

    const k1 = choose(data.kyc1_const_input, data.kyc1_join_input);
    if (k1) out[k1 === data.kyc1_const_input ? "kyc1_const_input" : "kyc1_join_input"] = k1;

    const k2 = choose(data.kyc2_const_input, data.kyc2_join_input);
    if (k2) out[k2 === data.kyc2_const_input ? "kyc2_const_input" : "kyc2_join_input"] = k2;
  }

  // Build normal sections (merge defaults + data)
  for (const section of required) {
    if (section === "images" || section === "process_img_req") continue; // handled later

    const defVal = options.defaults[section];
    const curVal = data[section];

    if (ARRAY_SECTIONS.has(section)) {
      if (curVal || defVal) out[section] = curVal ?? defVal;
    } else {
      if (curVal || defVal) {
        out[section] = defVal ? deepMerge(defVal, curVal || {}) : (curVal ?? defVal);
      }
    }
  }

  // Expand images group into flat keys
  if (required.includes("images") && data.images) {
    Object.assign(out, data.images);
  }

  // Process images request type
  if (type === "PROCESS_IMAGES" && data.process_img_req) {
    Object.assign(out, data.process_img_req);
  }

  // Strict presence check (lightweight)
  if (options.strict) {
    const missing = required.filter((s) => {
      if (s === "images") return false;               // images can be empty/omitted
      if (s === "process_img_req") return !data.process_img_req;
      // For JOINT, still need base singletons like custobj/addobj_*
      return out[s] === undefined;
    });
    if (missing.length) {
      throw new Error(`Missing required sections for ${type}: ${missing.join(", ")}`);
    }
  }

  return options.compact ? compact(out) : out;
}

module.exports = {
  buildPayload,
  // exporting for advanced usage/customization:
  REQUIRED_SECTIONS,
};