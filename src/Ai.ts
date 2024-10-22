import OpenAI from "openai";

const key = import.meta.env.VITE_API_KEY;


const openai = new OpenAI({ apiKey: key , dangerouslyAllowBrowser: true });
export async function getAnswer(question:string): Promise<string>{

    await new Promise(resolve => setTimeout(resolve, 1000));
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: question }],
      model: "gpt-4",
    });
    console.log()
    return ` ${completion.choices[0].message.content}`;
}
