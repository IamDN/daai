// import { DataSource } from "../DataSource";
// import { AreaBounds } from "../DataUtils";
// import { parseGrid } from "../../Workers";
// import { Patch, PatchConstants, PatchInfo, PatchLevel } from "../Patch";

//export class StaticSource implements DataSource {
export class StaticSource {
  private patchPaths: string[]

  constructor() {
    this.patchPaths = [];
    this.patchPaths.push(`designaction.csv`);
  }

//   public async getAvailablePatches(): Promise<PatchInfo[]> {
//     return this.patchPaths.map(path => {
//       const filename = path.substring(path.lastIndexOf('/') + 1);
//       const info = parseInfo(filename);
//       if (info) return info;
//       throw Error("Invalid filename format");
//     })
//   }
public async getData(): Promise<[string[], string[]]> {
  const path = `designaction.csv`;
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL("./data/" + path, base).href;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch error");

  const array = await response.arrayBuffer();
  const data = new TextDecoder().decode(array);

  // Split the CSV data by new lines (assuming the file has two lines)
  const rows = data.split(/\r?\n/); // Handles both Windows and Unix line endings

  // Ensure there are exactly two rows
  if (rows.length < 2) {
    throw new Error("Unexpected CSV format: Less than 2 rows found");
  }

  // Split each row by commas and trim any extra spaces
  const firstRow = rows[0].split(',').map(item => item.trim());
  const secondRow = rows[1].split(',').map(item => item.trim());
  
  // Return both rows as arrays
  return [firstRow, secondRow];
}
public async getDescription(world: string): Promise<[string[], string[]]> {
  const path = `${world}.csv`;
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL("./data/" + path, base).href;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch error");

  const array = await response.arrayBuffer();
  const data = new TextDecoder().decode(array);

  // Split the CSV data by new lines (assuming the file has two lines)
  const rows = data.split(/\r?\n/); // Handles both Windows and Unix line endings

  // Ensure there are exactly two rows
  if (rows.length < 2) {
    throw new Error("Unexpected CSV format: Less than 2 rows found");
  }

  // Split each row by commas and trim any extra spaces
  const firstRow = rows[0].split(',').map(item => item.trim());
  const secondRow = rows[1].split(',').map(item => item.trim());

  // Return both rows as arrays
  return [firstRow, secondRow];
}

public async getWordData(world: string): Promise<{ description: string, references: { author: string, year: number, title: string, journal?: string, volume?: number, issue?: number, pages?: string, publisher?: string }[], imageLinks: string[] }> {
  console.log(world);
  const path = `${world}.json`; // Change the file extension to .json
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL("./data/" + path, base).href;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch error");
  console.log("LOL");
  const data = await response.json(); // Parse the JSON response

  // Ensure the JSON data has the required structure
  if (!data.description || !data.references || !data.imageLinks) {
    throw new Error("Unexpected JSON format: Missing required properties");
  }
  console.log(data);
  // Return the relevant data
  return {
    description: data.description,
    references: data.references,
    imageLinks: data.imageLinks
  };
}
}

// export function parseInfo(filename: string): PatchInfo | null {
//   const regex = new RegExp("^(.*?)_(.*?)_(.*?)@(.*?)_(.*?)_(.*?)\\..+$");
//   const values = regex.exec(filename);

//   if (!values) return null;

//   const name = values[1];
//   const level = PatchLevel[values[2] as keyof typeof PatchLevel];
//   const site = values[3];
//   const patch = parseInt(values[4]);
//   const date = new Date(); // TODO

//   return {
//     level,
//     name,
//     site,
//     index: patch,
//     filename,
//     date,
//   }
// }
