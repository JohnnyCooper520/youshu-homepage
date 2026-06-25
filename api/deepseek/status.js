import { runApi } from "../_adapter.js";

export default function handler(req, res) {
  return runApi(req, res, "/api/deepseek/status");
}
