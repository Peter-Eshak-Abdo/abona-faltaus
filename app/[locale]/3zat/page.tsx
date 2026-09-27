"use client";

import AbDaodLam3yAltobaPlayer from "./AbDaodLam3yAltobaPlayer";
import AbDaodLam3yAlslaPlayer from "./AbDaodLam3yAlslaPlayer";
import BabaShenodyPlayer from "./BabaShenodyPlayer";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function W3zat() {
  const t = useTranslations('Sermons');

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-3xl sm:text-4xl text-center text-primary font-extrabold my-6">
          {t('pageTitle')}
        </h1>
        <h2 className="text-lg sm:text-xl text-secondary text-center font-light mb-6">
          {t('subtitle')}
        </h2>
        <Image
          src="/images/sec1.jpeg"
          alt="قسم العظات"
          className="rounded-xl shadow-md max-w-sm w-full"
          width={400}
          height={200}
          sizes="(max-width: 768px) 90vw"
        />
      </div>
      <div className="mt-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="dawood">
            <AccordionTrigger>{t('dawoodSection')}</AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="prayer">
                  <AccordionTrigger>{t('prayerSection')}</AccordionTrigger>
                  <AccordionContent>
                    <AbDaodLam3yAlslaPlayer />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="repentance">
                  <AccordionTrigger>{t('repentanceSection')}</AccordionTrigger>
                  <AccordionContent>
                    <AbDaodLam3yAltobaPlayer />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shenouda">
            <AccordionTrigger>{t('shenoudaSection')}</AccordionTrigger>
            <AccordionContent>
              <BabaShenodyPlayer />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
