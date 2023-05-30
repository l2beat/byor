CREATE TABLE `fetcherStates` (
	`chainId` integer PRIMARY KEY NOT NULL,
	`lastFetchedBlock` integer DEFAULT 0 NOT NULL
);
