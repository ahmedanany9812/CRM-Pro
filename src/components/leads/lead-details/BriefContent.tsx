import { LeadBrief } from "@/services/ai/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Lightbulb, MessageSquare, Target } from "lucide-react";

interface BriefContentProps {
  brief: LeadBrief;
}

export function BriefContent({ brief }: BriefContentProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Summary */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Situation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {brief.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Facts */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <CardTitle className="text-sm font-medium">Key Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {brief.keyFacts.map((fact, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-sm font-medium">Potential Risks</CardTitle>
        </CardHeader>
        <CardContent>
          {brief.risks.length > 0 ? (
            <ul className="space-y-2">
              {brief.risks.map((risk, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No immediate risks identified.</p>
          )}
        </CardContent>
      </Card>

      {/* Next Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm font-medium">Recommended Next Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brief.nextActions.map((action, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{action.action}</p>
                  {action.suggestedDueAt && (
                    <Badge variant="outline" className="text-[10px] font-normal px-1.5 h-4">
                      {action.suggestedDueAt}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{action.why}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions to Ask */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm font-medium">Specific Questions to Ask</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {brief.questionsToAskNext.map((question, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-100 italic">
                "{question}"
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
