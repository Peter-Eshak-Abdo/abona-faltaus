import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt, style = "coptic_icon" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    let fullPrompt = "";

    // توجيه البرومبت حسب الأسلوب المختار
    switch (style) {
      case "sweet_publishing":
        fullPrompt = `sweet_publishing_style, ${prompt}, classic bible story illustration, vintage watercolor comic storybook art, Jim Padgett style`;
        break;
      case "lumo_film":
        fullPrompt = `lumo_film_style, ${prompt}, cinematic historical biblical drama, realistic 35mm film still, The LUMO Project, authentic first century biblical scene, natural lighting, dramatic film photography`;
        break;
      case "coptic_icon":
      default:
        fullPrompt = `coptic_icon_style, ${prompt}, traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic style, egg tempera, golden halo, authentic Coptic iconography`;
        break;
    }

    // اسم الموديل الذي تم تدريبه على Replicate
    const modelIdentifier = "peter-eshak-abdo/biblical-multistyle-lora";

    const output: any = await replicate.run(
      modelIdentifier as `${string}/${string}`,
      {
        input: {
          prompt: fullPrompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
        },
      },
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate image" },
      { status: 500 },
    );
  }
}
