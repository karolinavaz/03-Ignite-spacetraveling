import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar } from 'react-icons/fi';
import { BiUser } from 'react-icons/bi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
 
  const [posts, setPosts] = useState(postsPagination);

  function loadMorePost() {
    if (posts?.next_page !== null) {
      try {
        fetch(posts?.next_page)
          .then(response => response.json())
          .then(data => {
            setPosts(prevPost => ({
              next_page: data?.next_page,
              results: prevPost?.results?.concat(data?.results)
            }));
          });
      } catch (error) {
        console.error('Error load more post')
      }
    }
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
       
        <div className={styles.containerHome}>
        <Header />
          {posts?.results?.map(posts => (
            <Link key={posts.uid} href={`/post/${posts?.uid}`} >
              <div className={styles.itemPost}>
              <h2>{posts?.data?.title}</h2>
              <p>{posts?.data?.subtitle}</p>
              <div className={commonStyles.infoContainer}>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(posts?.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                </div>
                <div>
                  <BiUser />
                  <span>{posts?.data?.author}</span>
                </div>
              </div>
              </div>
            </Link>
          ))}

          {posts?.next_page && (
            <button className={styles.buttonLoadMore} onClick={() => loadMorePost()}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({ req: params });

  const postsResponse = await prismic.getByType('posts', {
    fetch: ['post.title', 'post.content'],
    pageSize: 1,
  });
 
  const results = postsResponse?.results?.map(result => {
    return {
      uid: result?.uid,
      first_publication_date: result?.first_publication_date,
      data: {
        title: result?.data?.title,
        subtitle: result?.data?.subtitle,
        author: result?.data?.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse?.next_page,
    results: results,
  };


  return {
    props: {
      postsPagination,
    },
  };
};
