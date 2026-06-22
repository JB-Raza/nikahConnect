export type FaceMatchResult = {
  matched: boolean;
  /** Photos whose face did not match the selfie — the user must remove these. */
  unmatchedPhotoUris: string[];
};

/**
 * Integration seam for face verification.
 *
 * This is intentionally a stub: it simulates a result so the full onboarding
 * verification flow can be built and exercised on the simulator (which has no
 * camera and no ML runtime). When the backend / on-device model is ready,
 * replace ONLY the body of `verifyFaces` with the real call — the UI that
 * consumes it does not need to change.
 *
 * Flip `SIMULATION` to test the different UI paths:
 *  - 'pass'     -> every photo matches (happy path)
 *  - 'failLast' -> the last photo fails (remove-and-retry path)
 *  - 'failAll'  -> nothing matches
 */
type SimulationMode = 'pass' | 'failLast' | 'failAll';

const SIMULATION: SimulationMode = 'pass';
const SIMULATED_DELAY_MS = 1500;

export async function verifyFaces(_selfieUri: string, photoUris: string[]): Promise<FaceMatchResult> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  switch (SIMULATION) {
    case 'failAll':
      return { matched: false, unmatchedPhotoUris: [...photoUris] };
    case 'failLast':
      return photoUris.length > 1
        ? { matched: false, unmatchedPhotoUris: photoUris.slice(-1) }
        : { matched: true, unmatchedPhotoUris: [] };
    case 'pass':
    default:
      return { matched: true, unmatchedPhotoUris: [] };
  }
}
