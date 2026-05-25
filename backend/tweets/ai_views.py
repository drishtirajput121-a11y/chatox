from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from openai import OpenAI

client = OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url='https://openrouter.ai/api/v1',
)

class GenerateCaptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        hint = request.data.get('hint', '').strip()

        if not hint:
            return Response({'error': 'Hint is required'}, status=400)

        if len(hint) > 200:
            return Response({'error': 'Hint too long'}, status=400)

        try:
            response = client.chat.completions.create(
                model='openai/gpt-4o-mini',
                max_tokens=100,
                messages=[
                    {
                        'role': 'system',
                        'content': (
                            'You are a social media caption writer. '
                            'Generate a single engaging caption under 280 characters. '
                            'No hashtags unless asked. No quotes around the caption. '
                            'Just the caption text, nothing else.'
                        )
                    },
                    {
                        'role': 'user',
                        'content': f'Write a caption for: {hint}'
                    }
                ]
            )
            caption = response.choices[0].message.content.strip()
            return Response({'caption': caption})

        except Exception as e:
            return Response({'error': 'AI generation failed'}, status=500)