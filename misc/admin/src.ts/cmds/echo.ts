import { colorify } from "../log";

console.log(colorify.bold(process.argv[2] || "no message"));
