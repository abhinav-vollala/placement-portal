-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'INTERNSHIP', 'PART_TIME');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "eligibleBatch" TEXT,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "openings" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "preferredSkills" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "workMode" "WorkMode" NOT NULL DEFAULT 'ONSITE';
