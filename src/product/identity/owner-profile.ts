export type OwnerProfile = Readonly<{
  id: string;
  displayName: string;
  handle: string;
  initials: string;
  identityLine: string;
}>;

export type OwnerMapIdentity = Readonly<{
  id: string;
  label: string;
  note: string;
}>;

export type OwnerIdentity = Readonly<{
  profile: OwnerProfile;
  mapIdentity: OwnerMapIdentity;
}>;

export function copyOwnerIdentity(owner: OwnerIdentity): OwnerIdentity {
  return {
    profile: { ...owner.profile },
    mapIdentity: { ...owner.mapIdentity },
  };
}
