// "use client";
// import { useRouter } from "next/navigation";
// // import { useRouter } from "next/router";
// import snawi from "../../snawi.json";
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
/** */
// For Server-Side Rendering (SSR) alternative:
/*
export async function getServerSideProps(context) {
  const { id } = context.params;
  const post = posts.posts.find(p => p.id === id);

  return {
    props: {
      post: post || null
    }
  };
}
*/

// For Static Generation with data
// export async function getStaticProps({ params }) {
//   const snawiAl7an = snawi.snawi.find((p) => p.id === params.id);

//   return {
//     props: {
//       snawiAl7an: snawiAl7an || null,
//     },
//   };
// }
//------------------------------------------------------------------------------------------------------
// "use client";
// import { useParams } from "next/navigation";

// function Al7anTfasil() {
//   const params = useParams();
//   return (
//     <>
//       <h1>تفاصيلds لحن:</h1>
//       <p>Post: {params.slug}</p>
//     </>
//   );
// }
// export default Al7anTfasil;

//----------------------------------------------------------------------------------------
// /pages/posts/[id].js
// "use client";
// import { useParams } from 'next/navigation';

// const Post = () => {
//   const params = useParams();
//   const { id } = params; // Get dynamic parameter from the URL

//   return (
//     <div>
//       <h1>Post {id}</h1>
//       <p>This is the post page for post with ID: {id}</p>
//     </div>
//   );
// };

// export default Post;
//----------------------------------------------------------------------------------------------
// import { useRouter } from 'next/navigation';
// import { notFound } from 'next/navigation';

// interface PostProps {
//   post: {
//     id: string;
//     title: string;
//     content: string;
//   };
// }
// // Simulating a data fetch
// const posts = [
//   { id: '1', title: 'Post 1', content: 'This is the content of Post 1' },
//   { id: '2', title: 'Post 2', content: 'This is the content of Post 2' },
//   { id: '3', title: 'Post 3', content: 'This is the content of Post 3' }
// ];

// // Generate dynamic paths
// export async function getStaticPaths() {
//   const paths = posts.map(post => ({
//     params: { id: post.id }
//   }));

//   return {
//     paths,
//     fallback: false // Show 404 for paths not found
//   };
// }

// // Fetch data for the page at build time
// interface Params {
//   id: string;
// }

// export async function getStaticProps({ params }: { params: Params }) {
//   const post = posts.find(post => post.id === params.id);
//   return {
//     props: {
//       post
//     }
//   };
// }

// // const Post = ({ post }: PostProps) => {
// //   if (!post) {
// //     return post ? <p>Loading post...</p> : <p>Post data not available.</p>; // Or handle the loading/error state appropriately
// //   }
// //   return (
// //     <div>
// //       <h1>{post.title}</h1>
// //       <p>{post.content}</p>
// //     </div>
// //   );
// // };

// // export default Post;


// // /app/al7an/al7an-tfasil/[id]/page.tsx


// // This function fetches the post data based on the ID
// async function getPostData(id: string) {
//   const post = posts.find(post => post.id === id);
//   if (!post) {
//     return null; // Return null if the post is not found
//   }
//   return post;
// }

// export default async function PostPage({ params }: { params: { id: string } }) {
//   const post = await getPostData(params.id);

//   if (!post) {
//     notFound(); // If post doesn't exist, show 404
//   }

//   return (
//     <div>
//       <h1>{post.title}</h1>
//       <p>{post.content}</p>
//     </div>
//   );
// }
//-----------------------------------------------------------------------------------------

// interface ProductData {
//   id: string;
//   title: string;
//   price: number;
//   description: string;
//   productImg: string;
// }

// async function getData(iddd: string): Promise<ProductData> {
//   const res = await fetch("../../snawi.json");
//   // const res = await fetch(`http://localhost:4000/products/${iddd}`);
//   // The return value is *not* serialized
//   // You can return Date, Map, Set, etc.

//   if (!res.ok) {
//     // This will activate the closest `error.js` Error Boundary
//     throw new Error("Failed to fetch data");
//   }

//   return res.json();
// }

// const Page = async ({ params }: { params: { id: string } }) => {
//   const objData = await getData(params.id);
//   console.log(objData);

//   return (
//     <div
//       style={{
//         height: "100vh",
//         display: "grid",
//         alignItems: "center",
//         gridTemplateRows: "auto 1fr auto",
//       }}
//     >

//       <main style={{ textAlign: "center" }} className="flex">

//         <img alt="" src={`.${objData.productImg}`} />
//         <div className="product-details">
//           <div style={{ justifyContent: "space-between" }} className="flex">
//             <h2>{objData.title}</h2>
//             <p className="price">${objData.price}</p>
//           </div>
//           <p className="description">
//             {objData.description}
//           </p>
//           <button className="flex add-to-cart">

//             Add To Cart
//           </button>
//         </div>
//       </main>

//     </div>
//   );
// };

// export default Page;
//-----------------------------------------------------------------------------------
import { notFound } from 'next/navigation';

// Define the BlogPost type
interface BlogPost {
  title: string;
  content: string;
}

// Simulate fetching blog post data
async function getBlogPost(id: string): Promise<BlogPost | null> {
  const posts: Record<string, BlogPost> = {
    'snawi-0': { title: 'لحن بينشتي الصغير', content: 'هو لحن يقال بعد المجمع والمفرود ان الي يقوله الاب الكاهن بس ممكن الشماس هو الي يقوله مكان ومش بيتقال كتير' },
    'snawi-1': { title: 'لحن_البركة_(تين_أوأوشت)', content: 'ده اول لحن بيتقال في القداس بعد رفع بخور باكر لانه بعد ما ابونا بيرشم الشمامسة علشان يلبسوا التونية ممكن شخص يستني بره ويقول اللحن ده او الشمامسة وهما بيلبسوا ممكن يقولوا مع بعض' },
  };
  return posts[id] || null;
}

// Pre-render pages with the specified parameters
export async function generateStaticParams() {
  const postsToPreRender = ['snawi-0', 'snawi-1'];
  return postsToPreRender.map((id) => ({ id }));
}

// Page component
export default async function Page({ params, }: { params: { id: string }; }) {
  const { id } = params; // باقي الكود }

// export default async function BlogPostPage({params}: {params: { id: string };}) {
  const post = await getBlogPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <p>ID: {id}</p>
      {/* <p>ID: {params.id}</p> */}
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
