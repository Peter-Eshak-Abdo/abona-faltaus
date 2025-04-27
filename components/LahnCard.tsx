"use client";

import Image from "next/image";

export default function LahnCard({ title, image, audio }: { title: string; image: string; audio: string }) {
  return (
    <div className="card mb-4" data-aos="fade-up">
      <a href={image} data-lightbox="lahn-gallery" data-title={title}>
        <Image src={image} className="card-img-top" alt="صورة الهزات"  width={350} height={650}/>
      </a>
      <div className="card-body text-center">
        <h5 className="card-title">{title}</h5>
        <div className="d-flex justify-content-center gap-2">
          <a href={image} download className="btn btn-primary">تحميل الصورة</a>
          <a href={audio} download className="btn btn-warning">تحميل اللحن</a>
        </div>
      </div>
    </div>
  );
}
