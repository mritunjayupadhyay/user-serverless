// Database error interface for PostgreSQL
export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
}
