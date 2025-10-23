export interface VercelWebhookPayload {
  id: string;
  payload: {
    user: {
      id: string;
    };
    team: {
      id: string;
    };
    project: {
      id: string;
    };
    deployment: {
      id: string;
      customEnvironmentId: string | null;
      meta: {
        githubCommitAuthorName: string;
        githubCommitAuthorEmail: string;
        githubCommitMessage: string;
        githubCommitOrg: string;
        githubCommitRef: string;
        githubCommitRepo: string;
        githubCommitSha: string;
        githubDeployment: string;
        githubOrg: string;
        githubRepo: string;
        githubRepoOwnerType: string;
        githubCommitRepoId: string;
        githubRepoId: string;
        githubRepoVisibility: string;
        githubHost: string;
        githubCommitAuthorLogin: string;
        repoPushedAt: string;
        branchAlias: string;
        action: string;
        originalDeploymentId: string;
      };
      name: string;
      url: string;
      inspectorUrl: string;
    };
    links: {
      deployment: string;
      project: string;
    };
    name: string;
    plan: string;
    regions: string[];
    target: string;
    type: string;
    url: string;
  };
  createdAt: number;
  type: string;
}

export interface DiscordWebhookPayload {
  content: string;
}
