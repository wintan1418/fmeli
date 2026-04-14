import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "church-website",
  title: "Church Website",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.divider(),
            S.listItem()
              .title("Homepage")
              .child(
                S.list()
                  .title("Homepage content")
                  .items([
                    S.documentTypeListItem("announcement").title("Announcements (ticker)"),
                    S.documentTypeListItem("meeting").title("Meetings"),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem("page").title("Pages"),
            S.documentTypeListItem("post").title("Blog"),
            S.divider(),
            S.documentTypeListItem("sermon").title("Sermons"),
            S.documentTypeListItem("sermonSeries").title("Sermon Series"),
            S.divider(),
            S.documentTypeListItem("event").title("Events"),
            S.documentTypeListItem("registration").title("Event Registrations"),
            S.divider(),
            S.documentTypeListItem("assembly").title("Assemblies"),
            S.documentTypeListItem("pastor").title("Pastors & Team"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
