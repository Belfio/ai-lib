import { ActionFunctionArgs } from "@remix-run/node";
import s3 from "@/lib/s3";

export async function action({ request }: ActionFunctionArgs) {
  const { filename, contentType } = await request.json();

  const presignedUrl = await s3.docStoring.getSignedUrl(filename, contentType);

  return { presignedUrl };
}
