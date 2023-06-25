import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar } from 'react-icons/fi';
import { BiUser } from 'react-icons/bi';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { useEffect, useState } from 'react';

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

export default function Post({ post }: PostProps) {
  const [timeRead, setTimeRead] = useState('0 min');

  useEffect(() => {
    const countWords =
      post?.data?.content &&
      post?.data?.content.reduce((accumulator, currentValue) => {
        const arrayText = RichText.asText(currentValue?.body);

        return (
          accumulator +
          (arrayText? arrayText?.split(' ')?.length:0)  +
          (currentValue?.heading ? currentValue?.heading?.split(' ')?.length:0)
        );
      }, 0);

    let timeReadMinutes = countWords / 200;
    setTimeRead(`${Math.ceil(timeReadMinutes).toString()} min`);
  }, [post]);

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
        <main className={`${commonStyles.container} ${styles.container}`}>
          <div className={styles.header}>
            <Header />
          </div>
          <div className={!post?styles.loading:styles.hide}>
            <h1>Carregando...</h1>
          </div>
          <div
            className={styles.banner}
            style={{ backgroundImage: `url(${post?.data?.banner?.url})` }}
          ></div>
          <article className={styles.postContainer}>
            <div className={styles.postHeader}>
              <h1>{post?.data?.title}</h1>
              {post && <div className={commonStyles.infoContainer}>
                <div>
                  <FiCalendar />
                  <time>
                    {post && format(
                      new Date(post?.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                </div>
                <div>
                  <BiUser />
                  <span>{post?.data?.author}</span>
                </div>
                <div>
                  <AiOutlineClockCircle />
                  <span>{timeRead}</span>
                </div>
              </div>}
            </div>
            {post?.data?.content &&
              post?.data?.content?.length > 0 &&
              post?.data?.content.map(content => (
                <article className={styles.articleContent}>
                  <h3>{content?.heading}</h3>
                  {content?.body &&
                    content?.body?.map(body => {
                      return <p>{body?.text}</p>;
                    })}
                </article>
              ))}
          </article>
        </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  let posts = null;
  try {
    posts = await prismic.getByType('posts', {
      fetch: ['post.title', 'post.content'],
      pageSize: 2,
    });
  } catch (err) {}

  return {
    paths: [
        {
          params: {
            slug: posts?.results?.[0]?.slugs?.[0],
          },
        },
    ],
    fallback: true, // false or "blocking"
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({ req: params });

  const { slug } = params;
  let response = null;

  try {
    response = await prismic.getByUID('posts', String(slug), {});

  } catch (err) {}

  return {
    props: {
      post: response,
    },
    redirect: 30 * 60,
  };
};
