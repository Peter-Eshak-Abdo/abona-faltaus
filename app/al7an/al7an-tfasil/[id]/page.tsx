

function Al7anTfasil() {
  return (
    <>
      <h1>
        تفاصيل لحن:
      </h1>
    </>
  );
}

export default Al7anTfasil;


// async function getBlogPost(id: string) {
//   // Simulate fetching blog post data
//   const posts = {
//     '1': { title: 'First Blog Post', content: 'This is the content of the first post.' },
//     '2': { title: 'Second Blog Post', content: 'Content for the second blog entry.' },
//   };
//   return posts[id] || null;
// }
// interface PageProps {params: {id: string;};}
// export default async function BlogPostPage({ params }: PageProps) {
//   // No need to explicitly await params in this context with App Router
//   const { id } = params;
//   const post = await getBlogPost(id);
//   if (!post) {notFound();}
//   return (
//     <div>
//       <h1>{post?.title}</h1> {/* Use optional chaining */}
//       <p>{post?.content}</p> {/* Use optional chaining */}
//       <p>ID: {id}</p>
//     </div>
//   );
// }
// export async function generateStaticParams() {
//   return [{ id: '1' }, { id: '2' }]; // Example static params
// }
// ------------------------------------------------------------------------------------------------------------------

// import { notFound } from 'next/navigation';
// // Removed incorrect import as 'PageProps' is not exported from 'next/types'.

// // interface Props {
// //   params: {
// //     id: string;
// //   };
// // }


// interface BlogPost {
//   title: string;
//   content: string;
// }

// // export async function generateMetadata({ params }: { params: { id: string } }) {
// //   return {
// //     generator: 'Next.js',
// //     applicationName: 'Next.js',
// //     referrer: 'origin-when-cross-origin',
// //     keywords: ['Next.js', 'React', 'JavaScript'],
// //     authors: [{ name: 'Seb' }, { name: 'Josh', url: 'https://nextjs.org' }],
// //     creator: 'Jiachi Liu',
// //     publisher: 'Sebastian Markbåge',
// //     formatDetection: {
// //       email: false,
// //       address: false,
// //       telephone: false,
// //     },
// //   }
// // }
// async function getBlogPost(id: string): Promise<BlogPost | null> {
//   // Simulate fetching blog post data
//   const posts: Record<string, BlogPost> = {
//     'snawi-0': { title: 'لحن بينشتي الصغير', content: 'هو لحن يقال بعد المجمع والمفرود ان الي يقوله الاب الكاهن بس ممكن الشماس هو الي يقوله مكان ومش بيتقال كتير' },
//     'snawi-1': { title: 'لحن_البركة_(تين_أوأوشت)', content: 'ده اول لحن بيتقال في القداس بعد رفع بخور باكر لانه بعد ما ابونا بيرشم الشمامسة علشان يلبسوا التونية ممكن شخص يستني بره ويقول اللحن ده او الشمامسة وهما بيلبسوا ممكن يقولوا مع بعض' },
//   };
//   return posts[id] || null;
// }

// export async function generateStaticParams() {
//   // Define the IDs of the blog posts you want to pre-render
//   const postsToPreRender = ['snawi-0', 'snawi-1'];

//   return postsToPreRender.map((id) => ({ id }));
// }

// // export default async function BlogPostPage({ params }: Props) {
// export default async function BlogPostPage({ params }: { params: { id: string } }) {
//   const  { id } = params;
//   const post = await getBlogPost(id);

//   if (!post) {
//     notFound();
//   }

//   return (
//     <div>
//       <p>ID: {id}</p>
//       <h1>{post?.title}</h1> {/* Use optional chaining */}
//       <p>{post?.content}</p> {/* Use optional chaining */}
//     </div>
//   );
// }
// ------------------------------------------------------------------------------------------------------------------
// import { notFound } from 'next/navigation';

// // Define the BlogPost type
// interface BlogPost {
//   title: string;
//   content: string;
// }

// // Simulate fetching blog post data
// async function getBlogPost(id: string): Promise<BlogPost | null> {
//   const posts: Record<string, BlogPost> = {
//     'snawi-0': { title: 'لحن بينشتي الصغير', content: 'هو لحن يقال بعد المجمع والمفرود ان الي يقوله الاب الكاهن بس ممكن الشماس هو الي يقوله مكان ومش بيتقال كتير' },
//     'snawi-1': { title: 'لحن_البركة_(تين_أوأوشت)', content: 'ده اول لحن بيتقال في القداس بعد رفع بخور باكر لانه بعد ما ابونا بيرشم الشمامسة علشان يلبسوا التونية ممكن شخص يستني بره ويقول اللحن ده او الشمامسة وهما بيلبسوا ممكن يقولوا مع بعض' },
//   };
//   return posts[id] || null;
// }

// // Pre-render pages with the specified parameters
// export async function generateStaticParams() {
//   const postsToPreRender = ['snawi-0', 'snawi-1'];
//   return postsToPreRender.map((id) => ({ id }));
// }

// // Page component
// export default async function BlogPostPage({
//   params,
// }: {
//   params: { id: string }; // Ensure params is typed correctly as `{ id: string }`
// }) {
//   const { id } = params;
//   const post = await getBlogPost(id);

//   if (!post) {
//     notFound(); // Show 404 if the post is not found
//   }

//   return (
//     <div>
//       <p>ID: {id}</p>
//       <h1>{post?.title}</h1> {/* Optional chaining to avoid null errors */}
//       <p>{post?.content}</p>
//     </div>
//   );
// }


