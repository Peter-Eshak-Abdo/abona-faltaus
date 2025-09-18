import Image from "next/image";
import KyamaPlayer from "./KyamaPlayer";
import MeladPlayer from "./MeladPlayer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://abona-faltaus.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "الترانيم تفاحة",
  description: "ترانيم مسيحية ارثوذكسية",
  keywords: "ترانيم, ترانيم مسيحية, ترانيم ارثوذكسية, ترانيم عيد الميلاد, ترانيم عيد القيامة",
};

function Tranim() {
  return (
    <>
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-6xl text-center m-20 text-blue-600 font-extrabold">صفحة ابونا فلتاؤس</h1>
          <h2 className="text-2xl text-gray-600 text-center font-light mt-4"> الترانيم الارثوذكسية المسيحية</h2>
          <Image src="/images/sec1.jpeg" alt="الترانيم" className="rounded-lg border border-gray-300" width={750} height={500} sizes="(max-width: 768px) 90vw" />
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem valu="melad">
            <AccordionTrigger>ترانيم عيد الميلاد</AccordionTrigger>
            <AccordionContent>
              <MeladPlayer />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="kyama">
            <AccordionTrigger>ترانيم عيد القيامة</AccordionTrigger>
            <AccordionContent>
              <KyamaPlayer />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </>
  );
}

export default Tranim;
