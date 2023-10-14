export default [
  {
    type: "service",
    reg: /\/inter-api\/oodm-gateway\/template\/\d+\/service/gi,
    method: ["PUT", "POST"],
  },
  {
    type: "service",
    reg: /\/inter-api\/oodm-gateway\/template\/\d+\/subscription/gi,
    method: ["PUT", "POST"],
  },
  {
    type: "service",
    reg: /\/inter-api\/oodm-gateway\/template\/\d+\/instance\/\d+\/service/gi,
    method: ["PUT", "POST"],
  },
  {
    type: "service",
    reg: /\/inter-api\/oodm-gateway\/template\/\d+\/instance\/\d+\/subscription/gi,
    method: ["PUT", "POST"],
  },
  {
    type: "layout",
    reg: /\/api\/compose\/manage\/layouts\/Layout_\w+(?:\?=.+)?/gi,
    method: ["PUT"],
  },
] as const;
