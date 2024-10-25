import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface RequestVerifyDoc extends BaseDoc {
  user: ObjectId;
  requestContent: string; //this is either just an explanation or a link to an image
}
export interface VerificationDoc extends BaseDoc {
  user: ObjectId;
  verificationContent: string;
  approver: ObjectId;
}
/**
 * concept: ProfessionalVerifying [Item, User]
 */
export default class ProfessionalVerifyingConcept {
  public readonly requests: DocCollection<RequestVerifyDoc>;
  public readonly verifiedUsers: DocCollection<VerificationDoc>;
  /**
   * Make an instance of Requests.
   */
  constructor(collectionName: string) {
    this.verifiedUsers = new DocCollection<VerificationDoc>(collectionName);
    this.requests = new DocCollection<RequestVerifyDoc>(collectionName + "_requests");
  }

  async getVerifiedUsers() {
    return await this.verifiedUsers.readMany({}, { sort: { _id: -1 } });
  }

  async getVerifiedUser(user: ObjectId) {
    const verifications = await this.userVerifications(user);
    if (verifications === null) {
      throw new NotFoundError("This User is not verified!");
    }
    return await this.verifiedUsers.readOne({ user: user });
  }
  async getRequests() {
    return await this.requests.readMany({}, { sort: { _id: -1 } });
  }

  async submitRequest(user: ObjectId, content: string) {
    const _id = await this.requests.createOne({ user, requestContent: content });
    return { msg: "Request successfully created!", request: await this.requests.readOne({ _id }) };
  }

  async acceptRequest(_id: ObjectId, verificationContent: string, approver: ObjectId) {
    const request = await this.requests.readOne({ _id });
    if (!request) {
      throw new NotFoundError("no request found!");
    }
    const verification = await this.verifiedUsers.createOne({ user: request.user, verificationContent: verificationContent, approver: approver });

    await this.requests.deleteOne({ _id });

    return { msg: "Request for " + request?.user + " accepted successfully!", verification: verification };
  }
  async rejectRequest(_id: ObjectId) {
    const request = await this.requests.readOne({ _id });
    if (!request) {
      throw new NotFoundError("no request found!");
    }
    await this.requests.deleteOne({ _id });

    return { msg: "Request for " + request?.user + " rejected successfully!" };
  }
  async unverifyUser(_id: ObjectId) {
    const verification = await this.verifiedUsers.readOne({ _id });
    if (!verification) {
      throw new NotAllowedError("Can't unverify a user that isn't verified!");
    }
    await this.verifiedUsers.deleteOne({ _id });
    return { msg: "Successfully unverified verification: " + _id };
  }
  async userVerifications(user: ObjectId) {
    const verifications = await this.verifiedUsers.readMany({ user: user });
    if (verifications) return verifications;
    else return null;
  }
  async isUserVerified(user: ObjectId) {
    const verifications = await this.verifiedUsers.readOne({ user: user });
    if (verifications) return true;
    else return false;
  }
}
