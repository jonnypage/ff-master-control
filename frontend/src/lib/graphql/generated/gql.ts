/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n          query GetLeaderboardTeams {\n            leaderboardTeams {\n              _id\n              name\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetLeaderboardTeamsDocument,
    "\n          query GetMissionsForLeaderboard {\n            leaderboardMissions {\n              _id\n              name\n              isFinalChallenge\n            }\n          }\n        ": typeof types.GetMissionsForLeaderboardDocument,
    "\n          query GetTeamsForStore {\n            teams {\n              _id\n              name\n              credits\n            }\n          }\n        ": typeof types.GetTeamsForStoreDocument,
    "\n          mutation AdjustCredits($teamId: ID!, $amount: Int!) {\n            adjustCredits(teamId: $teamId, amount: $amount) {\n              _id\n              name\n              credits\n            }\n          }\n        ": typeof types.AdjustCreditsDocument,
    "\n          mutation TeamLogin($input: TeamLoginInput!) {\n            teamLogin(input: $input) {\n              access_token\n              team {\n                _id\n                name\n                teamGuid\n                image {\n                  url\n                }\n              }\n            }\n          }\n        ": typeof types.TeamLoginDocument,
    "\n          mutation Login($input: LoginInput!) {\n            login(input: $input) {\n              access_token\n              user {\n                _id\n                username\n                role\n              }\n            }\n          }\n        ": typeof types.LoginDocument,
    "\n          query GetUsers {\n            users {\n              _id\n              username\n              role\n              createdAt\n            }\n          }\n        ": typeof types.GetUsersDocument,
    "\n          mutation CreateUser($input: CreateUserDto!) {\n            createUser(input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        ": typeof types.CreateUserDocument,
    "\n          mutation UpdateUser($id: ID!, $input: UpdateUserDto!) {\n            updateUser(id: $id, input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        ": typeof types.UpdateUserDocument,
    "\n          mutation DeleteUser($id: ID!) {\n            deleteUser(id: $id)\n          }\n        ": typeof types.DeleteUserDocument,
    "\n          mutation DeleteAllTeams {\n            deleteAllTeams\n          }\n        ": typeof types.DeleteAllTeamsDocument,
    "\n          mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {\n            changePassword(id: $id, input: $input)\n          }\n        ": typeof types.ChangePasswordDocument,
    "\n          query GetTeams {\n            teams {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetTeamsDocument,
    "\n          query GetTeamById($id: ID!) {\n            teamById(id: $id) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetTeamByIdDocument,
    "\n          mutation CreateTeam($input: CreateTeamDto!) {\n            createTeam(input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        ": typeof types.CreateTeamDocument,
    "\n          mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {\n            updateTeam(id: $id, input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        ": typeof types.UpdateTeamDocument,
    "\n          mutation AddCredits($teamId: ID!, $amount: Int!) {\n            addCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        ": typeof types.AddCreditsDocument,
    "\n          mutation RemoveCredits($teamId: ID!, $amount: Int!) {\n            removeCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        ": typeof types.RemoveCreditsDocument,
    "\n          query GetMissionsForTeams {\n            missions {\n              _id\n            }\n          }\n        ": typeof types.GetMissionsForTeamsDocument,
    "\n          query GetMissions {\n            missions {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n              createdAt\n              updatedAt\n            }\n          }\n        ": typeof types.GetMissionsDocument,
    "\n          query GetTeamsForMissions {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetTeamsForMissionsDocument,
    "\n          query GetMission($id: ID!) {\n            mission(id: $id) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": typeof types.GetMissionDocument,
    "\n          mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {\n            updateMission(id: $id, input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": typeof types.UpdateMissionDocument,
    "\n          query GetTeamsForMission {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetTeamsForMissionDocument,
    "\n          query GetTeamsForMissionCompletion {\n            teams {\n              _id\n              name\n              credits\n              completedMissionIds\n            }\n          }\n        ": typeof types.GetTeamsForMissionCompletionDocument,
    "\n          mutation CompleteMission($missionId: ID!, $teamId: ID!) {\n            completeMission(missionId: $missionId, teamId: $teamId) {\n              _id\n              teamId\n              missionId\n              completedAt\n              completedBy\n              isManualOverride\n            }\n          }\n        ": typeof types.CompleteMissionDocument,
    "\n          query MyTeam {\n            myTeam {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": typeof types.MyTeamDocument,
    "\n          mutation RemoveMissionCompletion($missionId: ID!, $teamId: ID!) {\n            removeMissionCompletion(missionId: $missionId, teamId: $teamId)\n          }\n        ": typeof types.RemoveMissionCompletionDocument,
    "\n          mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {\n            overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {\n              _id\n            }\n          }\n        ": typeof types.OverrideMissionCompletionDocument,
    "\n          mutation CreateMission($input: CreateMissionDto!) {\n            createMission(input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": typeof types.CreateMissionDocument,
    "\n          query GetMissionsForTeamEdit {\n            missions {\n              _id\n              name\n            }\n          }\n        ": typeof types.GetMissionsForTeamEditDocument,
    "\n          query GetStats {\n            config {\n              requiredMissionsForFinal\n            }\n            teams {\n              _id\n            }\n            missions {\n              _id\n              isFinalChallenge\n            }\n          }\n        ": typeof types.GetStatsDocument,
};
const documents: Documents = {
    "\n          query GetLeaderboardTeams {\n            leaderboardTeams {\n              _id\n              name\n              completedMissionIds\n            }\n          }\n        ": types.GetLeaderboardTeamsDocument,
    "\n          query GetMissionsForLeaderboard {\n            leaderboardMissions {\n              _id\n              name\n              isFinalChallenge\n            }\n          }\n        ": types.GetMissionsForLeaderboardDocument,
    "\n          query GetTeamsForStore {\n            teams {\n              _id\n              name\n              credits\n            }\n          }\n        ": types.GetTeamsForStoreDocument,
    "\n          mutation AdjustCredits($teamId: ID!, $amount: Int!) {\n            adjustCredits(teamId: $teamId, amount: $amount) {\n              _id\n              name\n              credits\n            }\n          }\n        ": types.AdjustCreditsDocument,
    "\n          mutation TeamLogin($input: TeamLoginInput!) {\n            teamLogin(input: $input) {\n              access_token\n              team {\n                _id\n                name\n                teamGuid\n                image {\n                  url\n                }\n              }\n            }\n          }\n        ": types.TeamLoginDocument,
    "\n          mutation Login($input: LoginInput!) {\n            login(input: $input) {\n              access_token\n              user {\n                _id\n                username\n                role\n              }\n            }\n          }\n        ": types.LoginDocument,
    "\n          query GetUsers {\n            users {\n              _id\n              username\n              role\n              createdAt\n            }\n          }\n        ": types.GetUsersDocument,
    "\n          mutation CreateUser($input: CreateUserDto!) {\n            createUser(input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        ": types.CreateUserDocument,
    "\n          mutation UpdateUser($id: ID!, $input: UpdateUserDto!) {\n            updateUser(id: $id, input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        ": types.UpdateUserDocument,
    "\n          mutation DeleteUser($id: ID!) {\n            deleteUser(id: $id)\n          }\n        ": types.DeleteUserDocument,
    "\n          mutation DeleteAllTeams {\n            deleteAllTeams\n          }\n        ": types.DeleteAllTeamsDocument,
    "\n          mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {\n            changePassword(id: $id, input: $input)\n          }\n        ": types.ChangePasswordDocument,
    "\n          query GetTeams {\n            teams {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": types.GetTeamsDocument,
    "\n          query GetTeamById($id: ID!) {\n            teamById(id: $id) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": types.GetTeamByIdDocument,
    "\n          mutation CreateTeam($input: CreateTeamDto!) {\n            createTeam(input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        ": types.CreateTeamDocument,
    "\n          mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {\n            updateTeam(id: $id, input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        ": types.UpdateTeamDocument,
    "\n          mutation AddCredits($teamId: ID!, $amount: Int!) {\n            addCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        ": types.AddCreditsDocument,
    "\n          mutation RemoveCredits($teamId: ID!, $amount: Int!) {\n            removeCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        ": types.RemoveCreditsDocument,
    "\n          query GetMissionsForTeams {\n            missions {\n              _id\n            }\n          }\n        ": types.GetMissionsForTeamsDocument,
    "\n          query GetMissions {\n            missions {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n              createdAt\n              updatedAt\n            }\n          }\n        ": types.GetMissionsDocument,
    "\n          query GetTeamsForMissions {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        ": types.GetTeamsForMissionsDocument,
    "\n          query GetMission($id: ID!) {\n            mission(id: $id) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": types.GetMissionDocument,
    "\n          mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {\n            updateMission(id: $id, input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": types.UpdateMissionDocument,
    "\n          query GetTeamsForMission {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        ": types.GetTeamsForMissionDocument,
    "\n          query GetTeamsForMissionCompletion {\n            teams {\n              _id\n              name\n              credits\n              completedMissionIds\n            }\n          }\n        ": types.GetTeamsForMissionCompletionDocument,
    "\n          mutation CompleteMission($missionId: ID!, $teamId: ID!) {\n            completeMission(missionId: $missionId, teamId: $teamId) {\n              _id\n              teamId\n              missionId\n              completedAt\n              completedBy\n              isManualOverride\n            }\n          }\n        ": types.CompleteMissionDocument,
    "\n          query MyTeam {\n            myTeam {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        ": types.MyTeamDocument,
    "\n          mutation RemoveMissionCompletion($missionId: ID!, $teamId: ID!) {\n            removeMissionCompletion(missionId: $missionId, teamId: $teamId)\n          }\n        ": types.RemoveMissionCompletionDocument,
    "\n          mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {\n            overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {\n              _id\n            }\n          }\n        ": types.OverrideMissionCompletionDocument,
    "\n          mutation CreateMission($input: CreateMissionDto!) {\n            createMission(input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        ": types.CreateMissionDocument,
    "\n          query GetMissionsForTeamEdit {\n            missions {\n              _id\n              name\n            }\n          }\n        ": types.GetMissionsForTeamEditDocument,
    "\n          query GetStats {\n            config {\n              requiredMissionsForFinal\n            }\n            teams {\n              _id\n            }\n            missions {\n              _id\n              isFinalChallenge\n            }\n          }\n        ": types.GetStatsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetLeaderboardTeams {\n            leaderboardTeams {\n              _id\n              name\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetLeaderboardTeams {\n            leaderboardTeams {\n              _id\n              name\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetMissionsForLeaderboard {\n            leaderboardMissions {\n              _id\n              name\n              isFinalChallenge\n            }\n          }\n        "): (typeof documents)["\n          query GetMissionsForLeaderboard {\n            leaderboardMissions {\n              _id\n              name\n              isFinalChallenge\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeamsForStore {\n            teams {\n              _id\n              name\n              credits\n            }\n          }\n        "): (typeof documents)["\n          query GetTeamsForStore {\n            teams {\n              _id\n              name\n              credits\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation AdjustCredits($teamId: ID!, $amount: Int!) {\n            adjustCredits(teamId: $teamId, amount: $amount) {\n              _id\n              name\n              credits\n            }\n          }\n        "): (typeof documents)["\n          mutation AdjustCredits($teamId: ID!, $amount: Int!) {\n            adjustCredits(teamId: $teamId, amount: $amount) {\n              _id\n              name\n              credits\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation TeamLogin($input: TeamLoginInput!) {\n            teamLogin(input: $input) {\n              access_token\n              team {\n                _id\n                name\n                teamGuid\n                image {\n                  url\n                }\n              }\n            }\n          }\n        "): (typeof documents)["\n          mutation TeamLogin($input: TeamLoginInput!) {\n            teamLogin(input: $input) {\n              access_token\n              team {\n                _id\n                name\n                teamGuid\n                image {\n                  url\n                }\n              }\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation Login($input: LoginInput!) {\n            login(input: $input) {\n              access_token\n              user {\n                _id\n                username\n                role\n              }\n            }\n          }\n        "): (typeof documents)["\n          mutation Login($input: LoginInput!) {\n            login(input: $input) {\n              access_token\n              user {\n                _id\n                username\n                role\n              }\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetUsers {\n            users {\n              _id\n              username\n              role\n              createdAt\n            }\n          }\n        "): (typeof documents)["\n          query GetUsers {\n            users {\n              _id\n              username\n              role\n              createdAt\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation CreateUser($input: CreateUserDto!) {\n            createUser(input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        "): (typeof documents)["\n          mutation CreateUser($input: CreateUserDto!) {\n            createUser(input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation UpdateUser($id: ID!, $input: UpdateUserDto!) {\n            updateUser(id: $id, input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        "): (typeof documents)["\n          mutation UpdateUser($id: ID!, $input: UpdateUserDto!) {\n            updateUser(id: $id, input: $input) {\n              _id\n              username\n              role\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation DeleteUser($id: ID!) {\n            deleteUser(id: $id)\n          }\n        "): (typeof documents)["\n          mutation DeleteUser($id: ID!) {\n            deleteUser(id: $id)\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation DeleteAllTeams {\n            deleteAllTeams\n          }\n        "): (typeof documents)["\n          mutation DeleteAllTeams {\n            deleteAllTeams\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {\n            changePassword(id: $id, input: $input)\n          }\n        "): (typeof documents)["\n          mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {\n            changePassword(id: $id, input: $input)\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeams {\n            teams {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetTeams {\n            teams {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeamById($id: ID!) {\n            teamById(id: $id) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetTeamById($id: ID!) {\n            teamById(id: $id) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation CreateTeam($input: CreateTeamDto!) {\n            createTeam(input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        "): (typeof documents)["\n          mutation CreateTeam($input: CreateTeamDto!) {\n            createTeam(input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {\n            updateTeam(id: $id, input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        "): (typeof documents)["\n          mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {\n            updateTeam(id: $id, input: $input) {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation AddCredits($teamId: ID!, $amount: Int!) {\n            addCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        "): (typeof documents)["\n          mutation AddCredits($teamId: ID!, $amount: Int!) {\n            addCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation RemoveCredits($teamId: ID!, $amount: Int!) {\n            removeCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        "): (typeof documents)["\n          mutation RemoveCredits($teamId: ID!, $amount: Int!) {\n            removeCredits(teamId: $teamId, amount: $amount) {\n              _id\n              credits\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetMissionsForTeams {\n            missions {\n              _id\n            }\n          }\n        "): (typeof documents)["\n          query GetMissionsForTeams {\n            missions {\n              _id\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetMissions {\n            missions {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n              createdAt\n              updatedAt\n            }\n          }\n        "): (typeof documents)["\n          query GetMissions {\n            missions {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n              createdAt\n              updatedAt\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeamsForMissions {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetTeamsForMissions {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetMission($id: ID!) {\n            mission(id: $id) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "): (typeof documents)["\n          query GetMission($id: ID!) {\n            mission(id: $id) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {\n            updateMission(id: $id, input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "): (typeof documents)["\n          mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {\n            updateMission(id: $id, input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeamsForMission {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetTeamsForMission {\n            teams {\n              _id\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetTeamsForMissionCompletion {\n            teams {\n              _id\n              name\n              credits\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query GetTeamsForMissionCompletion {\n            teams {\n              _id\n              name\n              credits\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation CompleteMission($missionId: ID!, $teamId: ID!) {\n            completeMission(missionId: $missionId, teamId: $teamId) {\n              _id\n              teamId\n              missionId\n              completedAt\n              completedBy\n              isManualOverride\n            }\n          }\n        "): (typeof documents)["\n          mutation CompleteMission($missionId: ID!, $teamId: ID!) {\n            completeMission(missionId: $missionId, teamId: $teamId) {\n              _id\n              teamId\n              missionId\n              completedAt\n              completedBy\n              isManualOverride\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query MyTeam {\n            myTeam {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "): (typeof documents)["\n          query MyTeam {\n            myTeam {\n              _id\n              name\n              teamGuid\n              image {\n                url\n              }\n              credits\n              completedMissionIds\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation RemoveMissionCompletion($missionId: ID!, $teamId: ID!) {\n            removeMissionCompletion(missionId: $missionId, teamId: $teamId)\n          }\n        "): (typeof documents)["\n          mutation RemoveMissionCompletion($missionId: ID!, $teamId: ID!) {\n            removeMissionCompletion(missionId: $missionId, teamId: $teamId)\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {\n            overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {\n              _id\n            }\n          }\n        "): (typeof documents)["\n          mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {\n            overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {\n              _id\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          mutation CreateMission($input: CreateMissionDto!) {\n            createMission(input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "): (typeof documents)["\n          mutation CreateMission($input: CreateMissionDto!) {\n            createMission(input: $input) {\n              _id\n              name\n              description\n              creditsAwarded\n              isFinalChallenge\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetMissionsForTeamEdit {\n            missions {\n              _id\n              name\n            }\n          }\n        "): (typeof documents)["\n          query GetMissionsForTeamEdit {\n            missions {\n              _id\n              name\n            }\n          }\n        "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n          query GetStats {\n            config {\n              requiredMissionsForFinal\n            }\n            teams {\n              _id\n            }\n            missions {\n              _id\n              isFinalChallenge\n            }\n          }\n        "): (typeof documents)["\n          query GetStats {\n            config {\n              requiredMissionsForFinal\n            }\n            teams {\n              _id\n            }\n            missions {\n              _id\n              isFinalChallenge\n            }\n          }\n        "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;