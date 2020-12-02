/**
 * Ported to TypeScript from the freeCodeCamp /learn repository.
 */

import dotenv from "dotenv";
import { MongoClient, ObjectID } from "mongodb";

dotenv.config();

const { MONGO_DB, MONGO_URI, MONGO_USER, MONGO_PASSWORD } = process.env;

// Handle missing environment variables
if (!MONGO_DB || !MONGO_URI || !MONGO_USER || !MONGO_PASSWORD) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

MongoClient.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: { user: MONGO_USER, password: MONGO_PASSWORD },
    poolSize: 20,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    console.info("MongoDB connection successful.");

    const db = client.db(MONGO_DB);
    const user = db.collection("user");

    // Remove the existing seed data if present
    user.deleteMany(
      {
        _id: {
          $in: [
            new ObjectID("5bd30e0f1caf6ac3ddddddb5"),
            new ObjectID("5bd30e0f1caf6ac3ddddddb9"),
          ],
        },
      },
      async (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.info("Existing seed data cleaned");
        // seed the new data
        try {
          await user.insertOne({
            _id: new ObjectID("5bd30e0f1caf6ac3ddddddb5"),
            email: "nick@freecodecamp.org",
            emailVerified: true,
            progressTimestamps: [],
            isBanned: false,
            isCheater: false,
            username: "developmentuser",
            about: "",
            name: "Development User",
            location: "",
            picture: "",
            acceptedPrivacyTerms: true,
            sendQuincyEmail: true,
            currentChallengeId: "",
            isHonest: false,
            isFrontEndCert: false,
            isDataVisCert: false,
            isBackEndCert: false,
            isFullStackCert: false,
            isRespWebDesignCert: false,
            is2018DataVisCert: false,
            isFrontEndLibsCert: false,
            isJsAlgoDataStructCert: false,
            isApisMicroservicesCert: false,
            isInfosecQaCert: false,
            isQaCertV7: false,
            isInfosecCertV7: false,
            is2018FullStackCert: false,
            isSciCompPyCertV7: false,
            isDataAnalysisPyCertV7: false,
            isMachineLearningPyCertV7: false,
            completedChallenges: [],
            portfolio: [],
            yearsTopContributor: [],
            rand: 0.6126749173148205,
            theme: "default",
            profileUI: {
              isLocked: true,
              showAbout: false,
              showCerts: false,
              showDonation: false,
              showHeatMap: false,
              showLocation: false,
              showName: false,
              showPoints: false,
              showPortfolio: false,
              showTimeLine: false,
            },
            badges: {
              coreTeam: [],
            },
            isDonating: false,
            emailAuthLinkTTL: null,
            emailVerifyTTL: null,
            unsubscribeId: "1"
          });

          await user.insertOne({
            _id: new ObjectID("5bd30e0f1caf6ac3ddddddb9"),
            email: "nhcarrigan@gmail.com",
            emailVerified: true,
            progressTimestamps: [],
            isBanned: false,
            isCheater: false,
            username: "developmentuser",
            about: "",
            name: "Development User",
            location: "",
            picture: "",
            acceptedPrivacyTerms: true,
            sendQuincyEmail: true,
            currentChallengeId: "",
            isHonest: false,
            isFrontEndCert: false,
            isDataVisCert: false,
            isBackEndCert: false,
            isFullStackCert: false,
            isRespWebDesignCert: false,
            is2018DataVisCert: false,
            isFrontEndLibsCert: false,
            isJsAlgoDataStructCert: false,
            isApisMicroservicesCert: false,
            isInfosecQaCert: false,
            isQaCertV7: false,
            isInfosecCertV7: false,
            is2018FullStackCert: false,
            isSciCompPyCertV7: false,
            isDataAnalysisPyCertV7: false,
            isMachineLearningPyCertV7: false,
            completedChallenges: [],
            portfolio: [],
            yearsTopContributor: [],
            rand: 0.6126749173148205,
            theme: "default",
            profileUI: {
              isLocked: true,
              showAbout: false,
              showCerts: false,
              showDonation: false,
              showHeatMap: false,
              showLocation: false,
              showName: false,
              showPoints: false,
              showPortfolio: false,
              showTimeLine: false,
            },
            badges: {
              coreTeam: [],
            },
            isDonating: false,
            emailAuthLinkTTL: null,
            emailVerifyTTL: null,
            unsubscribeId: "2"
          });
        } catch (err) {
          console.error(err);
        } finally {
          console.info("Seeded database.");
          process.exit(0)
        }
      }
    );
  }
);
