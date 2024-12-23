import styles from "./ReplyBox.module.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { CommentFormValue } from "../../config/formValues";
import { useParams } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { CommentValue } from "../../config/typeValues";
import Loader from "../Loader/Loader";
const domain = import.meta.env.VITE_DOMAIN;

interface Props {
  replyToUsername: string;
  replyToId: string;
  comment: CommentValue;
  commentId: string;
  parentId?: string;
  replyInputRef: React.MutableRefObject<null | HTMLInputElement>;
  updateComment: ({ updatedComment }: { updatedComment: CommentValue }) => void;
  view?: boolean;
  setView?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReplyBox: FC<Props> = ({
  replyToUsername,
  replyToId,
  comment,
  commentId,
  parentId,
  replyInputRef,
  updateComment,
  view,
  setView,
}) => {
  const params = useParams();
  const postId = params.postid;
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CommentFormValue>();
  const { ref, ...rest } = register("content", {
    required: "Comment is required",
    validate: (value) => {
      const regex = new RegExp(/\s/, "g");
      const filteredValue = value.replace(regex, "");
      return filteredValue.length > 0
        ? true
        : "Comment cannot only contain white-space characters";
    },
  });
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const focus = () => {
      const current = replyInputRef.current;

      if (current) {
        current.focus();
      }
    };

    focus();

    return () => {
      const current = replyInputRef.current;

      if (current) {
        current.blur();
      }
    };
  }, [replyInputRef]);

  const onSubmit: SubmitHandler<CommentFormValue> = async (data) => {
    const formData = new URLSearchParams();
    formData.append("content", data.content);
    formData.append("replytoid", replyToId);

    if (parentId) {
      formData.append("parentid", parentId);
    }

    setInput("");

    setIsSubmitting(true);
    try {
      const reply = await fetch(
        `${domain}/post/${postId}/comment/${commentId}/reply`,
        {
          mode: "cors",
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const replyData = await reply.json();

      if (replyData.error) {
        console.log(`${replyData.error.message}: Reply Box`);

        // Handle validation error
        if (replyData.error.errors) {
          const errorList = replyData.error.errors;

          errorList.forEach(
            (error: { field: string; value: string; msg: string }) =>
              console.log(error.msg)
          );
        }
      } else {
        const newReply = replyData.reply;
        let updatedComment = comment;

        if (comment.replies) {
          updatedComment = {
            ...updatedComment,
            replies: [newReply, ...comment.replies],
          };
        }
        updatedComment._count.replies += 1;
        updateComment({ updatedComment });
        if (view !== undefined) {
          if (!view) {
            if (setView) {
              setView(true);
            }
          }
        }
      }
    } catch (err) {
      console.log("Something went wrong!: Reply Box");
      if (err instanceof TypeError) console.log(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.replyBox}>
      <p className={styles.replyTo}>
        To
        <span className={styles.replyToUsername}> {`@${replyToUsername}`}</span>
      </p>
      <form
        className={styles.replyBoxForm}
        method="post"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.inputContainer}>
          <label
            className={styles.hidden}
            htmlFor="comment"
            aria-label="Comment to post"
          >
            Reply
          </label>
          {errors && errors.content && (
            <div className={styles.errorText}>{errors.content.message}</div>
          )}
          <input
            className={styles.replyInput}
            id="reply"
            placeholder="Write a reply"
            value={input}
            onInput={(e) => {
              const current = e.target as HTMLInputElement;
              setInput(current.value);
            }}
            ref={(e) => {
              ref(e);
              replyInputRef.current = e;
            }}
            autoComplete="off"
            {...rest}
          ></input>
        </div>
        {isSubmitting ? (
          <Loader
            type="spinner"
            size={{ width: "1.5em", height: "1.5em" }}
            color="var(--accent-color-1)"
          />
        ) : (
          <button
            className={styles.replyButton}
            aria-label="Reply to comment"
          ></button>
        )}
      </form>
    </div>
  );
};

export default ReplyBox;
