import { FACULTY_SCOPED_ROLES } from "@/lib/auth"

export function filterArticlesForViewer(articles, viewer) {
  if (viewer.role === "manager" || viewer.role === "admin") {
    return articles
  }

  if (FACULTY_SCOPED_ROLES.has(viewer.role) && viewer.faculty) {
    return articles.filter((article) => article.faculty === viewer.faculty)
  }

  return []
}

export function canViewArticle(article, viewer) {
  return filterArticlesForViewer([article], viewer).length > 0
}

export function canEditArticle(article, viewer) {
  const viewerId = viewer.id || viewer.userId

  return (
    viewer.role === "student" &&
    Boolean(viewerId) &&
    article.ownerId === viewerId
  )
}
