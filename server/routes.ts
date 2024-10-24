import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, CommentOnPost, Friending, LikeOnPost, Posting, ProfessionalVerifying, Sessioning, VoteOnPost } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { Session } from "express-session";
import { z } from "zod";
import { CommentOptions } from "./concepts/commenting";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    const users = await Authing.getUsers();
    const usersUpdated = [];
    for (const user of users) {
      if (await ProfessionalVerifying.isUserVerified(user._id)) {
        usersUpdated.push({ ...user, verified: true });
      } else {
        usersUpdated.push({ ...user, verified: false });
      }
    }
    return usersUpdated;
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    const user = await Authing.getUserByUsername(username);
    if (await ProfessionalVerifying.isUserVerified(user._id)) {
      return { ...user, verified: true };
    } else {
      return { ...user, verified: false };
    }
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    posts = await Responses.posts(posts);
    const postsExtended = [];
    for (const post of posts) {
      const numLikes = await LikeOnPost.getNumLikes(post._id);
      const comments = await CommentOnPost.getByItem(post._id);
      const votes = await VoteOnPost.getCorrectnessVotes(post._id);
      postsExtended.push({ ...post, likes: numLikes, comments: comments, votes: votes });
    }
    return postsExtended;
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.get("/posts/:id")
  async getPostByID(id: string) {
    return await Responses.post(await Posting.getByID(new ObjectId(id)));
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  //Comments on Posts
  @Router.patch("/posts/:pid/comments/:id")
  async updateCommentOnPost(session: SessionDoc, pid: string, id: string, content?: string, options?: CommentOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await CommentOnPost.assertAuthorIsUser(oid, user);
    return await CommentOnPost.update(oid, content, options);
  }

  @Router.delete("/posts/:pid/comments/:id")
  async deleteCommentOnPost(session: SessionDoc, pid: string, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await CommentOnPost.assertAuthorIsUser(oid, user);
    return CommentOnPost.delete(oid);
  }

  @Router.get("/posts/:pid/comments")
  @Router.validate(z.object({ pid: z.string() }))
  async getCommentsOnPosts(pid: string) {
    const id = new ObjectId(pid);
    const comments = await CommentOnPost.getByItem(id);

    return Responses.comments(comments);
  }
  @Router.post("/posts/:pid/comments")
  async createCommentOnPost(session: SessionDoc, pid: string, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const itemID = new ObjectId(pid);
    await Posting.assertPostExists(itemID); //check if that post exists!
    const created = await CommentOnPost.create(itemID, user, content, options);
    return { msg: created.msg, comment: await Responses.comment(created.comment) };
  }

  //Likes on Posts
  @Router.get("/users/:username/likes")
  async getLikes(username: string) {
    const id = (await Authing.getUserByUsername(username))._id;
    return Responses.likes(await LikeOnPost.getLikesByUser(id));
  }

  @Router.get("/posts/:pid/likes")
  async getNumLikesOnPost(pid: string) {
    const oid = new ObjectId(pid);
    return await LikeOnPost.getNumLikes(oid);
  }

  @Router.post("/posts/:pid/likes")
  async addLikeOnPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    await Posting.assertPostExists(oid); //check if that post exists!
    const liked = await LikeOnPost.addLike(oid, user);
    return { msg: liked.msg, like: await Responses.like(liked.like) };
  }

  @Router.delete("/posts/:pid/likes")
  async removeLikeOnPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    await Posting.assertPostExists(oid); //check if that post exists!
    return await LikeOnPost.removeLike(oid, user);
  }

  @Router.get("/posts/:pid/likes/check")
  async checkIfUserLikedPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    return await LikeOnPost.checkLikeExists(oid, user);
  }

  //Correctness Voting on posts

  /**
   * Returns number of correct/incorrect votes on post
   */
  @Router.get("/posts/:pid/cvote")
  async getCorrectnessVotesOnPost(pid: string) {
    const oid = new ObjectId(pid);
    return await VoteOnPost.getCorrectnessVotes(oid);
  }

  /**
   * votes correct on a post
   */
  @Router.post("/posts/:pid/cvote/correct")
  async voteCorrectOnPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    await Posting.assertPostExists(oid); //check if that post exists!
    const voted = await VoteOnPost.voteCorrect(oid, user);
    return { msg: voted.msg, like: await Responses.vote(voted.vote) };
  }

  /**
   * votes incorrect on a post
   */
  @Router.post("/posts/:pid/cvote/incorrect")
  async voteIncorrectOnPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    await Posting.assertPostExists(oid); //check if that post exists!
    const voted = await VoteOnPost.voteIncorrect(oid, user);
    return { msg: voted.msg, like: await Responses.vote(voted.vote) };
  }

  /**
   * removes vote on a post
   */
  @Router.delete("/posts/:pid/cvote")
  async removeVoteOnPost(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    await Posting.assertPostExists(oid); //check if that post exists!
    return await VoteOnPost.removeVote(oid, user);
  }

  @Router.get("/posts/:pid/cvote/user")
  async getUserVote(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    return await VoteOnPost.getVote(oid, user);
  }

  @Router.get("/posts/:pid/cvote/check")
  async checkUserVote(session: SessionDoc, pid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(pid);
    return await VoteOnPost.checkVoteExists(oid, user);
  }

  //Professional Verifying

  /**
   * gets verified user by username
   */
  @Router.get("/verified")
  @Router.validate(z.object({ username: z.string().optional() }))
  async getVerifiedUsers(username: string) {
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      return Responses.verification(await ProfessionalVerifying.getVerifiedUser(id));
    }
    const verifiedUsers = await ProfessionalVerifying.getVerifiedUsers();

    return Responses.verifications(verifiedUsers);
  }

  /**
   * Get requests
   */
  @Router.get("/verified/request")
  async getVerificationRequests() {
    return Responses.requestverifys(await ProfessionalVerifying.getRequests());
  }

  /**
   * submit a verification request
   */
  @Router.post("/verified/request")
  async submitVerificationReq(session: Session, content: string) {
    const user = Sessioning.getUser(session);
    const created = await ProfessionalVerifying.submitRequest(user, content);
    return { msg: created.msg, request: await Responses.requestverify(created.request) };
  }

  /**
   * Approve a verification request - must be an administrator
   */
  @Router.post("/verified/request/:id")
  async approveVerificationReq(session: Session, id: string, verificationContent: string) {
    const user = Sessioning.getUser(session);
    await Authing.assertUserIsAdmin(user);
    const oid = new ObjectId(id);
    return await ProfessionalVerifying.acceptRequest(oid, verificationContent, user);
  }

  /**
   * Reject a verification request - must be an administrator
   */
  @Router.delete("/verified/request/:id")
  async rejectVerificationReq(session: Session, id: string) {
    const user = Sessioning.getUser(session);
    await Authing.assertUserIsAdmin(user);
    const oid = new ObjectId(id);
    return await ProfessionalVerifying.rejectRequest(oid);
  }

  /**
   * Unverifies a User - must be an administrator
   */
  @Router.delete("/verified/:username")
  async unverifyUser(session: Session, username: string) {
    const user = Sessioning.getUser(session);
    await Authing.assertUserIsAdmin(user);
    const id = (await Authing.getUserByUsername(username))._id;
    return await ProfessionalVerifying.unverifyUser(id);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
