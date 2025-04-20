// import { useRouter } from "next/router";
// import snawi from "../snawi.json";
// import NotFound from "@/app/not-found";

// export default function Post() {
//   const router = useRouter();
//   const { id } = router.query;
//   const snawiAl7an = snawi.snawi.find((p) => p.id === id);

//   if (!snawiAl7an) {
//     return <div>Post not found</div>;
//   }

//   return (
//     <div>
//       <h1>{snawiAl7an.name}</h1>
//       {/* <p>{snawiAl7an.content}</p> */}
//     </div>
//   );
// }

// // For Static Site Generation (SSG)
// export async function getStaticPaths() {
//   const paths = snawi.snawi.map((snawiAl7an) => ({
//     params: { id: snawiAl7an.id },
//   }));

//   return {
//     paths,
//     fallback: <NotFound/>, // Show 404 for unknown ids
//   };
// }

// // For Server-Side Rendering (SSR) alternative:
// /*
// export async function getServerSideProps(context) {
//   const { id } = context.params;
//   const post = posts.posts.find(p => p.id === id);

//   return {
//     props: {
//       post: post || null
//     }
//   };
// }
// */

// // For Static Generation with data
// export async function getStaticProps({ params }) {
//   const snawiAl7an = snawi.snawi.find((p) => p.id === params.id);

//   return {
//     props: {
//       snawiAl7an: snawiAl7an || null,
//     },
//   };
// }

"use client";
import { useParams } from "next/navigation";

function Al7anTfasil() {
  const params = useParams();
  return (
    <>
      <h1>تفاصيل لحن:</h1>
      <p>Post: {params.slug}</p>
    </>
  );
}
export default Al7anTfasil;
