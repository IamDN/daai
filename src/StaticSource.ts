
export interface WordCombos {
  name: string;
 snippets: string;

}
//export class StaticSource implements DataSource {
export class StaticSource {
  private patchPaths: string[]


  constructor() {
    this.patchPaths = [];
    this.patchPaths.push(`designaction.csv`);
  }


public async getData(): Promise<[WordCombos[], WordCombos[]]> {
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
  var firstcombos: WordCombos[] = [];
  var secondcombos: WordCombos[] = [];

  for (let i = 0; i < firstRow.length; i++) {
    var snippet = await this.getSnipped(firstRow[i]);
    firstcombos.push({ name: firstRow[i], snippets: snippet});
  }
  for (let i = 0; i < secondRow.length; i++) {
    var snippet = await this.getSnipped(secondRow[i]);
    secondcombos.push({ name: secondRow[i], snippets: snippet });
  }

  // Return both rows as arrays
  return [firstcombos,  secondcombos];
}
public async getSnipped(world: string): Promise<string> {
  const path = `${world}.json`; // Change the file extension to .json
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL("./data/" + path, base).href;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch error");
  const data = await response.json(); // Parse the JSON response

  // Ensure the JSON data has the required structure
  if (!data.snippet ) {
    throw new Error("Unexpected JSON format: Missing required properties");
  }
  // Return the relevant data
  return data.snippet;
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

public async getWordData(world: string): Promise<{ description: string, literature: string[], imageLinks: string[] }> {
  const path = `${world}.json`; // Change the file extension to .json
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL("./data/" + path, base).href;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Fetch error");
  const data = await response.json(); // Parse the JSON response

  // Ensure the JSON data has the required structure
  if (!data.description || !data.literature || !data.imageLinks) {
    throw new Error("Unexpected JSON format: Missing required properties");
  }
  // Return the relevant data
  return {
    description: data.description,
    literature: data.literature,
    imageLinks: data.imageLinks
  };
}
public async getLiteratureFromWords(word1: string, word2: string): Promise<string[]> {
  // Helper function to fetch and extract literature from a single JSON file
  const fetchLiterature = async (word: string): Promise<string[]> => {
    const path = `${word}.json`;
    const base = window.location.origin + import.meta.env.BASE_URL;
    const url = new URL("./data/" + path, base).href;
    console.log(url)
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch error for ${word}`);

    const data = await response.json();

    // Ensure JSON has the required structure
    if (!data.literature) throw new Error(`Unexpected JSON format for ${word}: Missing literature property`);

    return data.literature;
  };

  // Fetch literature for each word and combine them
  const [literature1, literature2] = await Promise.all([
    fetchLiterature(word1),
    fetchLiterature(word2)
  ]);

  // Merge both literature arrays
  const combined = [...literature1, ...literature2];

  // Remove duplicates and push any duplicates to the start
  const uniqueSet = new Set<string>();
  const duplicates: string[] = [];

  for (const book of combined) {
    if (uniqueSet.has(book)) {
      // If it's a duplicate, push to duplicates array
      if (!duplicates.includes(book)) {
        duplicates.push(book);
      }
    } else {
      uniqueSet.add(book);
    }
  }

  // Combine duplicates at the beginning with the rest of the unique books
  return [...duplicates, ...Array.from(uniqueSet).filter(book => !duplicates.includes(book))];
}
}


