import AbDaodLam3yAltobaPlayer from "./AbDaodLam3yAltobaPlayer";
import AbDaodLam3yAlslaPlayer from "./AbDaodLam3yAlslaPlayer";
import BabaShenodyPlayer from "./BabaShenodyPlayer";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  metadataBase: new URL(process.env.VERCEL_URL || "https://abona-faltaus.vercel.app"),
  title: "العظات تفاحة",
  description: "العظات الارثوذكسية المسيحية",
  keywords: "العظات, العظات الارثوذكسية, عظات ابونا فلتاؤس, عظات ابونا داؤد لمعي, عظات البابا شنودة",
}

function W3zat() {
  return (
    <>
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-5xl text-center text-primary font-extrabold my-10">
            صفحة ابونا فلتاؤس
          </h1>
          <h2 className="text-2xl text-secondary text-center font-light mb-8">
            العظات الارثوذكسية المسيحية
          </h2>
          <Image
            src="/images/sec1.jpeg"
            alt="قسم العظات"
            className="rounded shadow-lg"
            width={400}
            height={200}
            sizes="(max-width: 768px) 90vw"
          />
        </div>
        <div className="mt-10">
          <Accordion type="single" collapsible>
            <AccordionItem value="dawood">
              <AccordionTrigger>قسم عظات ابونا داؤد لمعي</AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="prayer">
                    <AccordionTrigger>قسم الصلاة</AccordionTrigger>
                    <AccordionContent>
                      <AbDaodLam3yAlslaPlayer />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="repentance">
                    <AccordionTrigger>قسم التوبة</AccordionTrigger>
                    <AccordionContent>
                      <AbDaodLam3yAltobaPlayer />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shenouda">
              <AccordionTrigger>قسم عظات البابا شنودة</AccordionTrigger>
              <AccordionContent>
                <BabaShenodyPlayer />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </>
  );
}

export default W3zat;
