/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AppConfig = {
  _id: Scalars['ID']['output'];
  requiredMissionsForFinal: Scalars['Float']['output'];
};

export type AuthPayload = {
  access_token: Scalars['String']['output'];
  user: User;
};

export type ChangePasswordDto = {
  newPassword: Scalars['String']['input'];
  oldPassword?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMissionDto = {
  awardsCrystal: Scalars['Boolean']['input'];
  creditsAwarded: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isFinalChallenge: Scalars['Boolean']['input'];
  missionDuration?: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type CreateTeamDto = {
  bannerColor?: InputMaybe<Scalars['String']['input']>;
  bannerIcon?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<TeamImageInput>;
  name: Scalars['String']['input'];
  pin: Scalars['String']['input'];
};

export type CreateUserDto = {
  password: Scalars['String']['input'];
  role: UserRole;
  username: Scalars['String']['input'];
};

export type LeaderboardTeam = {
  _id: Scalars['ID']['output'];
  bannerColor: Scalars['String']['output'];
  bannerIcon: Scalars['String']['output'];
  missions: Array<TeamMission>;
  name: Scalars['String']['output'];
};

export type LoginInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Mission = {
  _id: Scalars['ID']['output'];
  awardsCrystal: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  creditsAwarded: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  isFinalChallenge: Scalars['Boolean']['output'];
  missionDuration: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MissionCompletion = {
  _id: Scalars['ID']['output'];
  completedAt: Scalars['DateTime']['output'];
  completedBy: Scalars['ID']['output'];
  isManualOverride: Scalars['Boolean']['output'];
  missionId: Scalars['ID']['output'];
  teamId: Scalars['ID']['output'];
};

export type MissionStatus =
  | 'COMPLETE'
  | 'FAILED'
  | 'INCOMPLETE'
  | 'NOT_STARTED';

export type Mutation = {
  addCredits: Team;
  adjustCredits: Team;
  changePassword: Scalars['Boolean']['output'];
  completeMission: MissionCompletion;
  createMission: Mission;
  createTeam: Team;
  createUser: User;
  deleteAllTeams: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: AuthPayload;
  overrideMissionCompletion: MissionCompletion;
  removeCredits: Team;
  removeMissionCompletion: Scalars['Boolean']['output'];
  staffSignup: User;
  teamLogin: TeamAuthPayload;
  updateConfig: AppConfig;
  updateMission: Mission;
  updateTeam: Team;
  updateUser: User;
};


export type MutationAddCreditsArgs = {
  amount: Scalars['Int']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationAdjustCreditsArgs = {
  amount: Scalars['Int']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  id: Scalars['ID']['input'];
  input: ChangePasswordDto;
};


export type MutationCompleteMissionArgs = {
  missionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationCreateMissionArgs = {
  input: CreateMissionDto;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamDto;
};


export type MutationCreateUserArgs = {
  input: CreateUserDto;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationOverrideMissionCompletionArgs = {
  missionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationRemoveCreditsArgs = {
  amount: Scalars['Int']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationRemoveMissionCompletionArgs = {
  missionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationStaffSignupArgs = {
  input: CreateUserDto;
};


export type MutationTeamLoginArgs = {
  input: TeamLoginInput;
};


export type MutationUpdateConfigArgs = {
  requiredMissionsForFinal: Scalars['Int']['input'];
};


export type MutationUpdateMissionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMissionDto;
};


export type MutationUpdateTeamArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeamDto;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserDto;
};

export type Query = {
  config: AppConfig;
  leaderboardMissions: Array<Mission>;
  leaderboardTeams: Array<LeaderboardTeam>;
  me?: Maybe<User>;
  mission?: Maybe<Mission>;
  missionCompletions: Array<MissionCompletion>;
  missions: Array<Mission>;
  myTeam?: Maybe<Team>;
  searchTeam?: Maybe<Team>;
  team?: Maybe<Team>;
  teamById?: Maybe<Team>;
  teams: Array<Team>;
  users: Array<User>;
};


export type QueryMissionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMissionCompletionsArgs = {
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchTeamArgs = {
  searchTerm: Scalars['String']['input'];
};


export type QueryTeamArgs = {
  teamGuid: Scalars['String']['input'];
};


export type QueryTeamByIdArgs = {
  id: Scalars['ID']['input'];
};

export type Team = {
  _id: Scalars['ID']['output'];
  bannerColor: Scalars['String']['output'];
  bannerIcon: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  credits: Scalars['Float']['output'];
  crystals: Scalars['Float']['output'];
  image?: Maybe<TeamImage>;
  missions: Array<TeamMission>;
  name: Scalars['String']['output'];
  pin?: Maybe<Scalars['String']['output']>;
  teamCode: Scalars['String']['output'];
  teamGuid: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamAuthPayload = {
  access_token: Scalars['String']['output'];
  team: Team;
};

export type TeamImage = {
  url?: Maybe<Scalars['String']['output']>;
};

export type TeamImageInput = {
  url?: InputMaybe<Scalars['String']['input']>;
};

export type TeamLoginInput = {
  pin: Scalars['String']['input'];
  teamCode: Scalars['String']['input'];
};

export type TeamMission = {
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  creditsReceived: Scalars['Float']['output'];
  crystalsReceived: Scalars['Float']['output'];
  missionId: Scalars['ID']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: MissionStatus;
  tries: Scalars['Float']['output'];
};

export type UpdateMissionDto = {
  awardsCrystal?: InputMaybe<Scalars['Boolean']['input']>;
  creditsAwarded?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isFinalChallenge?: InputMaybe<Scalars['Boolean']['input']>;
  missionDuration?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamDto = {
  bannerColor?: InputMaybe<Scalars['String']['input']>;
  bannerIcon?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<TeamImageInput>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserDto = {
  role?: InputMaybe<UserRole>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserRole =
  | 'ADMIN'
  | 'MISSION_LEADER'
  | 'QUEST_GIVER'
  | 'STORE';

export type LeaderboardTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type LeaderboardTeamsQuery = { leaderboardTeams: Array<{ _id: string, name: string, bannerColor: string, bannerIcon: string, missions: Array<{ missionId: string, status: MissionStatus, completedAt?: any | null }> }> };

export type GetMissionsForLeaderboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMissionsForLeaderboardQuery = { leaderboardMissions: Array<{ _id: string, name: string, isFinalChallenge: boolean }> };

export type GetTeamsForStoreQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsForStoreQuery = { teams: Array<{ _id: string, name: string, teamCode: string, bannerColor: string, bannerIcon: string, credits: number, crystals: number, missions: Array<{ missionId: string, status: MissionStatus }> }> };

export type AdjustCreditsMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  amount: Scalars['Int']['input'];
}>;


export type AdjustCreditsMutation = { adjustCredits: { _id: string, name: string, credits: number, crystals: number } };

export type TeamLoginMutationVariables = Exact<{
  input: TeamLoginInput;
}>;


export type TeamLoginMutation = { teamLogin: { access_token: string, team: { _id: string, name: string, teamCode: string, teamGuid: string, bannerColor: string, bannerIcon: string, image?: { url?: string | null } | null } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { access_token: string, user: { _id: string, username: string, role: UserRole } } };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { users: Array<{ _id: string, username: string, role: UserRole, createdAt: any }> };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserDto;
}>;


export type CreateUserMutation = { createUser: { _id: string, username: string, role: UserRole } };

export type StaffSignupMutationVariables = Exact<{
  input: CreateUserDto;
}>;


export type StaffSignupMutation = { staffSignup: { _id: string, username: string, role: UserRole } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserDto;
}>;


export type UpdateUserMutation = { updateUser: { _id: string, username: string, role: UserRole } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { deleteUser: boolean };

export type DeleteAllTeamsMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAllTeamsMutation = { deleteAllTeams: boolean };

export type ChangePasswordMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ChangePasswordDto;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type GetTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsQuery = { teams: Array<{ _id: string, name: string, teamCode: string, teamGuid: string, bannerColor: string, bannerIcon: string, credits: number, crystals: number, image?: { url?: string | null } | null, missions: Array<{ missionId: string, status: MissionStatus }> }> };

export type GetTeamByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTeamByIdQuery = { teamById?: { _id: string, name: string, teamCode: string, teamGuid: string, bannerColor: string, bannerIcon: string, credits: number, crystals: number, image?: { url?: string | null } | null, missions: Array<{ missionId: string, status: MissionStatus }> } | null };

export type CreateTeamMutationVariables = Exact<{
  input: CreateTeamDto;
}>;


export type CreateTeamMutation = { createTeam: { _id: string, name: string, teamCode: string, teamGuid: string, bannerColor: string, bannerIcon: string, image?: { url?: string | null } | null } };

export type UpdateTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTeamDto;
}>;


export type UpdateTeamMutation = { updateTeam: { _id: string, name: string, teamGuid: string, bannerColor: string, bannerIcon: string, image?: { url?: string | null } | null } };

export type AddCreditsMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  amount: Scalars['Int']['input'];
}>;


export type AddCreditsMutation = { addCredits: { _id: string, credits: number, crystals: number } };

export type RemoveCreditsMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  amount: Scalars['Int']['input'];
}>;


export type RemoveCreditsMutation = { removeCredits: { _id: string, credits: number, crystals: number } };

export type GetMissionsForTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMissionsForTeamsQuery = { missions: Array<{ _id: string }> };

export type GetMissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMissionsQuery = { missions: Array<{ _id: string, name: string, description?: string | null, creditsAwarded: number, awardsCrystal: boolean, isFinalChallenge: boolean, createdAt: any, updatedAt: any }> };

export type GetTeamsForMissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsForMissionsQuery = { teams: Array<{ _id: string, missions: Array<{ missionId: string, status: MissionStatus }> }> };

export type GetMissionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMissionQuery = { mission?: { _id: string, name: string, description?: string | null, creditsAwarded: number, awardsCrystal: boolean, isFinalChallenge: boolean } | null };

export type UpdateMissionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMissionDto;
}>;


export type UpdateMissionMutation = { updateMission: { _id: string, name: string, description?: string | null, creditsAwarded: number, awardsCrystal: boolean, isFinalChallenge: boolean } };

export type GetTeamsForMissionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsForMissionQuery = { teams: Array<{ _id: string, missions: Array<{ missionId: string, status: MissionStatus }> }> };

export type GetTeamsForMissionCompletionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsForMissionCompletionQuery = { teams: Array<{ _id: string, name: string, bannerColor: string, bannerIcon: string, credits: number, crystals: number, missions: Array<{ missionId: string, status: MissionStatus }> }> };

export type CompleteMissionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
}>;


export type CompleteMissionMutation = { completeMission: { _id: string, teamId: string, missionId: string, completedAt: any, completedBy: string, isManualOverride: boolean } };

export type MyTeamQueryVariables = Exact<{ [key: string]: never; }>;


export type MyTeamQuery = { myTeam?: { _id: string, name: string, teamCode: string, teamGuid: string, pin?: string | null, bannerColor: string, bannerIcon: string, credits: number, crystals: number, image?: { url?: string | null } | null, missions: Array<{ missionId: string, status: MissionStatus }> } | null };

export type RemoveMissionCompletionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
}>;


export type RemoveMissionCompletionMutation = { removeMissionCompletion: boolean };

export type OverrideMissionCompletionMutationVariables = Exact<{
  teamId: Scalars['ID']['input'];
  missionId: Scalars['ID']['input'];
}>;


export type OverrideMissionCompletionMutation = { overrideMissionCompletion: { _id: string } };

export type CreateMissionMutationVariables = Exact<{
  input: CreateMissionDto;
}>;


export type CreateMissionMutation = { createMission: { _id: string, name: string, description?: string | null, creditsAwarded: number, awardsCrystal: boolean, isFinalChallenge: boolean } };

export type GetMissionsForTeamEditQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMissionsForTeamEditQuery = { missions: Array<{ _id: string, name: string, isFinalChallenge: boolean }> };

export type GetStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStatsQuery = { config: { requiredMissionsForFinal: number }, teams: Array<{ _id: string }>, missions: Array<{ _id: string, isFinalChallenge: boolean }> };


export const LeaderboardTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaderboardTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaderboardTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<LeaderboardTeamsQuery, LeaderboardTeamsQueryVariables>;
export const GetMissionsForLeaderboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMissionsForLeaderboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaderboardMissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<GetMissionsForLeaderboardQuery, GetMissionsForLeaderboardQueryVariables>;
export const GetTeamsForStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamsForStore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamsForStoreQuery, GetTeamsForStoreQueryVariables>;
export const AdjustCreditsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdjustCredits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adjustCredits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}}]}}]}}]} as unknown as DocumentNode<AdjustCreditsMutation, AdjustCreditsMutationVariables>;
export const TeamLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TeamLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamLoginMutation, TeamLoginMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const StaffSignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StaffSignup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staffSignup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<StaffSignupMutation, StaffSignupMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const DeleteAllTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAllTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAllTeams"}}]}}]} as unknown as DocumentNode<DeleteAllTeamsMutation, DeleteAllTeamsMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const GetTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamsQuery, GetTeamsQueryVariables>;
export const GetTeamByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamByIdQuery, GetTeamByIdQueryVariables>;
export const CreateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTeamDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CreateTeamMutation, CreateTeamMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTeamDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const AddCreditsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCredits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCredits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}}]}}]}}]} as unknown as DocumentNode<AddCreditsMutation, AddCreditsMutationVariables>;
export const RemoveCreditsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCredits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCredits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}}]}}]}}]} as unknown as DocumentNode<RemoveCreditsMutation, RemoveCreditsMutationVariables>;
export const GetMissionsForTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMissionsForTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<GetMissionsForTeamsQuery, GetMissionsForTeamsQueryVariables>;
export const GetMissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"creditsAwarded"}},{"kind":"Field","name":{"kind":"Name","value":"awardsCrystal"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMissionsQuery, GetMissionsQueryVariables>;
export const GetTeamsForMissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamsForMissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamsForMissionsQuery, GetTeamsForMissionsQueryVariables>;
export const GetMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"creditsAwarded"}},{"kind":"Field","name":{"kind":"Name","value":"awardsCrystal"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<GetMissionQuery, GetMissionQueryVariables>;
export const UpdateMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMissionDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"creditsAwarded"}},{"kind":"Field","name":{"kind":"Name","value":"awardsCrystal"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<UpdateMissionMutation, UpdateMissionMutationVariables>;
export const GetTeamsForMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamsForMission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamsForMissionQuery, GetTeamsForMissionQueryVariables>;
export const GetTeamsForMissionCompletionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamsForMissionCompletion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetTeamsForMissionCompletionQuery, GetTeamsForMissionCompletionQueryVariables>;
export const CompleteMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedBy"}},{"kind":"Field","name":{"kind":"Name","value":"isManualOverride"}}]}}]}}]} as unknown as DocumentNode<CompleteMissionMutation, CompleteMissionMutationVariables>;
export const MyTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"teamCode"}},{"kind":"Field","name":{"kind":"Name","value":"teamGuid"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"bannerColor"}},{"kind":"Field","name":{"kind":"Name","value":"bannerIcon"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"credits"}},{"kind":"Field","name":{"kind":"Name","value":"crystals"}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<MyTeamQuery, MyTeamQueryVariables>;
export const RemoveMissionCompletionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMissionCompletion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMissionCompletion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}]}]}}]} as unknown as DocumentNode<RemoveMissionCompletionMutation, RemoveMissionCompletionMutationVariables>;
export const OverrideMissionCompletionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OverrideMissionCompletion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"overrideMissionCompletion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<OverrideMissionCompletionMutation, OverrideMissionCompletionMutationVariables>;
export const CreateMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMissionDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"creditsAwarded"}},{"kind":"Field","name":{"kind":"Name","value":"awardsCrystal"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<CreateMissionMutation, CreateMissionMutationVariables>;
export const GetMissionsForTeamEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMissionsForTeamEdit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<GetMissionsForTeamEditQuery, GetMissionsForTeamEditQueryVariables>;
export const GetStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requiredMissionsForFinal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalChallenge"}}]}}]}}]} as unknown as DocumentNode<GetStatsQuery, GetStatsQueryVariables>;