import styles from "./HomePage.module.css";
import NavBar from "../../components/NavBar/NavBar";
import { useEffect, useState } from "react";
import { PostValue } from "../../config/typeValues";
import { fetchData } from "../../utils/fetchFunctions";
import PostItem from "../../components/PostItem/PostItem";

const HomePage = () => {
  const [posts, setPosts] = useState<null | PostValue[]>(null);

  const updateLikesBox = ({
    likesBox,
    userLikeStatus,
  }: {
    likesBox: {
      id: string;
      _count: {
        likes: number;
      };
    };
    userLikeStatus: boolean;
  }) => {
    if (posts) {
      const selectedPost = posts.find(
        (post) => post.likesBox.id === likesBox.id
      );
      const changedPost = { ...selectedPost, likesBox, userLikeStatus };
      const updatedPosts = posts.map((post) => {
        return post.id === changedPost.id ? changedPost : post;
      }) as PostValue[];

      setPosts([...updatedPosts]);
    }
  };

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      const followingPosts = await fetchData({
        link: `http://localhost:3000/posts/following`,
        options: {
          method: "GET",
          credentials: "include",
        },
      });

      if (followingPosts?.isError) {
        console.error(followingPosts?.data.error, followingPosts?.data.errors);
      } else {
        console.log(followingPosts?.data.posts);
        setPosts(followingPosts?.data.posts);
      }
    };

    fetchFollowingPosts();

    return () => {
      setPosts(null);
    };
  }, []);

  return (
    <>
      <NavBar />
      <main className={styles.mainWrapper}>
        <ul className={styles.postList}>
          {posts &&
            posts.map((post) => {
              return (
                <PostItem
                  post={post}
                  updateLikesBox={updateLikesBox}
                  key={post.id}
                />
              );
            })}
        </ul>
      </main>
    </>
  );
};

export default HomePage;
