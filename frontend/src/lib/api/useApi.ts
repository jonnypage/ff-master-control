import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RequestDocument } from 'graphql-request';
import { graphql } from '@/lib/graphql/generated';
import type {
  GetLeaderboardTeamsQuery,
  GetMissionsForLeaderboardQuery,
} from '@/lib/graphql/generated';
import { graphqlClient } from '@/lib/graphql/client';

export function useLeaderboardTeams() {
  return useQuery<GetLeaderboardTeamsQuery>({
    queryKey: ['leaderboard-teams'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetLeaderboardTeams {
            leaderboardTeams {
              _id
              name
              completedMissionIds
            }
          }
        `) as unknown as RequestDocument,
      ),
    refetchInterval: 3000,
  });
}

export function useLeaderboardMissions() {
  return useQuery<GetMissionsForLeaderboardQuery>({
    queryKey: ['leaderboard-missions'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetMissionsForLeaderboard {
            leaderboardMissions {
              _id
              name
              isFinalChallenge
            }
          }
        `) as unknown as RequestDocument,
      ),
    refetchInterval: 3000,
  });
}

export function useTeamsForStore() {
  return useQuery({
    queryKey: ['teams-for-store'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeamsForStore {
            teams {
              _id
              name
              nfcCardId
              credits
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useAdjustCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { nfcCardId: string; amount: number }) =>
      graphqlClient.request(
        graphql(`
          mutation AdjustCredits($nfcCardId: String!, $amount: Int!) {
            adjustCredits(nfcCardId: $nfcCardId, amount: $amount) {
              _id
              name
              nfcCardId
              credits
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-for-store'] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (variables: {
      input: { username: string; password: string };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              access_token
              user {
                _id
                username
                role
              }
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetUsers {
            users {
              _id
              username
              role
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      input: { username: string; password: string; role: string };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation CreateUser($input: CreateUserDto!) {
            createUser(input: $input) {
              _id
              username
              role
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string;
      input: { username?: string; role?: string };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation UpdateUser($id: ID!, $input: UpdateUserDto!) {
            updateUser(id: $id, input: $input) {
              _id
              username
              role
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string }) =>
      graphqlClient.request(
        graphql(`
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteAllTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      graphqlClient.request(
        graphql(`
          mutation DeleteAllTeams {
            deleteAllTeams
          }
        `) as unknown as RequestDocument,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['teams-for-store'] });
      qc.invalidateQueries({ queryKey: ['leaderboard-teams'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (variables: {
      id: string;
      input: { newPassword: string; oldPassword?: string };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {
            changePassword(id: $id, input: $input)
          }
        `) as unknown as RequestDocument,
        variables,
      ),
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeams {
            teams {
              _id
              name
              nfcCardId
              credits
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useTeamById(id: string) {
  return useQuery({
    queryKey: ['team-by-id', id],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeamById($id: ID!) {
            teamById(id: $id) {
              _id
              name
              nfcCardId
              credits
            }
          }
        `) as unknown as RequestDocument,
        { id },
      ),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { input: { name: string; nfcCardId: string } }) =>
      graphqlClient.request(
        graphql(`
          mutation CreateTeam($input: CreateTeamDto!) {
            createTeam(input: $input) {
              _id
              name
              nfcCardId
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string;
      input: { name?: string; nfcCardId?: string };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {
            updateTeam(id: $id, input: $input) {
              _id
              name
              nfcCardId
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useAddCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { nfcCardId: string; amount: number }) =>
      graphqlClient.request(
        graphql(`
          mutation AddCredits($nfcCardId: String!, $amount: Int!) {
            addCredits(nfcCardId: $nfcCardId, amount: $amount) {
              _id
              credits
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useRemoveCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { nfcCardId: string; amount: number }) =>
      graphqlClient.request(
        graphql(`
          mutation RemoveCredits($nfcCardId: String!, $amount: Int!) {
            removeCredits(nfcCardId: $nfcCardId, amount: $amount) {
              _id
              credits
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useMissionsForTeams() {
  return useQuery({
    queryKey: ['missions-for-teams'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetMissionsForTeams {
            missions {
              _id
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetMissions {
            missions {
              _id
              name
              description
              creditsAwarded
              isFinalChallenge
              createdAt
              updatedAt
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useTeamsForMissions() {
  return useQuery({
    queryKey: ['teams-for-missions'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeamsForMissions {
            teams {
              _id
              completedMissionIds
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useMission(id?: string) {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetMission($id: ID!) {
            mission(id: $id) {
              _id
              name
              description
              creditsAwarded
              isFinalChallenge
            }
          }
        `) as unknown as RequestDocument,
        { id },
      ),
    enabled: !!id,
  });
}

export function useUpdateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string;
      input: {
        name?: string;
        description?: string;
        creditsAwarded?: number;
        isFinalChallenge?: boolean;
      };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {
            updateMission(id: $id, input: $input) {
              _id
              name
              description
              creditsAwarded
              isFinalChallenge
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useTeamsForMission() {
  return useQuery({
    queryKey: ['teams-for-mission'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeamsForMission {
            teams {
              _id
              completedMissionIds
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useTeamsForMissionCompletion() {
  return useQuery({
    queryKey: ['teams-for-mission-completion'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetTeamsForMissionCompletion {
            teams {
              _id
              name
              nfcCardId
              credits
              completedMissionIds
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useCompleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { missionId: string; nfcCardId: string }) =>
      graphqlClient.request(
        graphql(`
          mutation CompleteMission($missionId: ID!, $nfcCardId: String!) {
            completeMission(missionId: $missionId, nfcCardId: $nfcCardId) {
              _id
              teamId
              missionId
              completedAt
              completedBy
              isManualOverride
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams-for-mission-completion'] });
      qc.invalidateQueries({ queryKey: ['leaderboard-teams'] });
    },
  });
}

export function useRemoveMissionCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { missionId: string; teamId: string }) =>
      graphqlClient.request(
        graphql(`
          mutation RemoveMissionCompletion($missionId: ID!, $teamId: ID!) {
            removeMissionCompletion(missionId: $missionId, teamId: $teamId)
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams-for-mission-completion'] });
      qc.invalidateQueries({ queryKey: ['leaderboard-teams'] });
    },
  });
}

export function useOverrideMissionCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { teamId: string; missionId: string }) =>
      graphqlClient.request(
        graphql(`
          mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {
            overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {
              _id
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions-for-team-edit'] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      input: {
        name: string;
        description?: string;
        creditsAwarded: number;
        isFinalChallenge: boolean;
      };
    }) =>
      graphqlClient.request(
        graphql(`
          mutation CreateMission($input: CreateMissionDto!) {
            createMission(input: $input) {
              _id
              name
              description
              creditsAwarded
              isFinalChallenge
            }
          }
        `) as unknown as RequestDocument,
        variables,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['missions'] }),
  });
}

export function useMissionsForTeamEdit() {
  return useQuery({
    queryKey: ['missions-for-team-edit'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetMissionsForTeamEdit {
            missions {
              _id
              name
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () =>
      graphqlClient.request(
        graphql(`
          query GetStats {
            config {
              requiredMissionsForFinal
            }
            teams {
              _id
            }
            missions {
              _id
              isFinalChallenge
            }
          }
        `) as unknown as RequestDocument,
      ),
  });
}
