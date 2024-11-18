import styles from "./PostDetailsPage.module.css";

const PostDetailsPageSkeleton = () => {
  return (
    <>
      <div className={styles.postImages}></div>

      <div className={styles.postData}>
        <div className={styles.postDataItem}>
          <div className={styles.postProfile}>
            <div className={styles.postUserProfileSkeleton}></div>
            <div className={styles.postProfileItem}>
              <div className={styles.displayNameSkeleton}></div>
              <div className={styles.usernameSkeleton}></div>
            </div>
          </div>
          <div>
            <div className={styles.captionSkeleton}></div>
            <div className={styles.captionSkeleton}></div>
            <div className={styles.captionSkeleton}></div>
          </div>

          <div className={styles.interactionInfo}>
            <div className={styles.interactionButtons}>
              <div className={styles.buttonSkeleton}></div>
              <div className={styles.buttonSkeleton}></div>
            </div>
            <div className={styles.likeInfoSkeleton}></div>
          </div>
        </div>

        <div className={styles.commentSkeleton}></div>
      </div>
    </>
  );
};

export default PostDetailsPageSkeleton;