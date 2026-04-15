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
            S.listItem()
              .title("Resources")
              .child(
                S.list()
                  .title("Resources")
                  .items([
                    S.documentTypeListItem("message").title("Messages"),
                    S.documentTypeListItem("messageSeries").title(
                      "Message Series",
                    ),
                    S.documentTypeListItem("messageCategory").title(
                      "Message Categories",
                    ),
                    S.divider(),
                    S.documentTypeListItem("worshipSession").title(
                      "Worship Sessions",
                    ),
                    S.documentTypeListItem("track").title("Lively Music"),
                    S.divider(),
                    S.documentTypeListItem("tip").title("Tips"),
                    S.documentTypeListItem("tipCategory").title(
                      "Tip Categories",
                    ),
                  ]),
              ),
            S.documentTypeListItem("book").title("Shop · Books"),
            S.divider(),
            S.documentTypeListItem("event").title("Events"),
            S.documentTypeListItem("registration").title("Event Registrations"),
            S.divider(),
            S.documentTypeListItem("assembly").title("Assemblies"),
            S.documentTypeListItem("assemblyReport").title("Assembly Reports"),
            S.divider(),
            S.documentTypeListItem("member").title("Members"),
            S.divider(),
            S.listItem()
              .title("People")
              .child(
                S.list()
                  .title("People")
                  .items([
                    S.listItem()
                      .title("Pastors & Leaders")
                      .schemaType("pastor")
                      .child(
                        S.documentTypeList("pastor")
                          .title("Pastors & Leaders")
                          .filter('_type == "pastor" && department == "pastoral"'),
                      ),
                    S.listItem()
                      .title("Church Office")
                      .schemaType("pastor")
                      .child(
                        S.documentTypeList("pastor")
                          .title("Church Office")
                          .filter('_type == "pastor" && department == "office"'),
                      ),
                    S.listItem()
                      .title("Worship & Music")
                      .schemaType("pastor")
                      .child(
                        S.documentTypeList("pastor")
                          .title("Worship & Music")
                          .filter('_type == "pastor" && department == "worship"'),
                      ),
                    S.listItem()
                      .title("Media & Tech")
                      .schemaType("pastor")
                      .child(
                        S.documentTypeList("pastor")
                          .title("Media & Tech")
                          .filter('_type == "pastor" && department == "media"'),
                      ),
                    S.listItem()
                      .title("Ministries (Youth, Women, Men, Outreach)")
                      .schemaType("pastor")
                      .child(
                        S.documentTypeList("pastor")
                          .title("Ministries")
                          .filter(
                            '_type == "pastor" && department in ["youth","women","men","outreach"]',
                          ),
                      ),
                    S.divider(),
                    S.listItem()
                      .title("All People")
                      .schemaType("pastor")
                      .child(S.documentTypeList("pastor").title("All People")),
                  ]),
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
