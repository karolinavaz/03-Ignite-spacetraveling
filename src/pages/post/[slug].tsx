import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {
  console.log("post", post)
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>

      <main className={commonStyles.container}>
        <Header />
        <div style={{backgroundImage: post?.data?.banner?.url}}>
          <img src={post?.data?.banner?.url} alt={post?.data?.title} className={styles.banner}/>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    fetch: ['post.title', 'post.content'],
    pageSize: 1,
  });
  console.log('posts', JSON.stringify(posts));
  return {
    paths: [
      {
        params: {
          slug: posts?.results?.[0]?.uid,
        },
      }, // See the "paths" section below
    ],
    fallback: true, // false or "blocking"
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({ req: params });
  console.log('params', params);
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response?.first_publication_date,
    data: {
      title: response?.data?.title,
      banner: {
        url: response?.data?.banner?.url,
      },
      author: response?.data?.author,
      content: response?.data?.content?.map(content => {
        return {
          heading: content?.heading,
          body: {
            text: RichText.asText(content?.body),
          },
        };
      }),
    },
  };

  console.log('post', post);
  return {
    props: {
      post
    },
  };
};
