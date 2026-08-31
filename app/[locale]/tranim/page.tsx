"use client";

import Image from "next/image";
import KyamaPlayer from "./KyamaPlayer";
import MeladPlayer from "./MeladPlayer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function Tranim() {
  const t = useTranslations('Tranim');

  return (
    <main className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-6xl text-center m-20 text-blue-600 font-extrabold">{t('pageTitle')}</h1>
        <h2 className="text-2xl text-gray-600 text-center font-light mt-4">{t('subtitle')}</h2>
        <Image src="/images/sec1.jpeg" alt="الترانيم" className="rounded-lg border border-gray-300" width={750} height={500} sizes="(max-width: 768px) 90vw" />
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="melad">
          <AccordionTrigger>{t('meladSection')}</AccordionTrigger>
          <AccordionContent>
            <MeladPlayer />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="kyama">
          <AccordionTrigger>{t('kyamaSection')}</AccordionTrigger>
          <AccordionContent>
            <KyamaPlayer />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
