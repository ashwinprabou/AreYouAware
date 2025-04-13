from datetime import date
from record import record_to_wav
from transcribe import transcribe_audio
from gemini_prompt import prompt_gemini

def get_user_input():
    # Step 1: Record
    record_to_wav("gm.wav", duration=30)
    
    # Step 2: Transcribe
    user_input = transcribe_audio("gm.wav")
    print("\n🗣️ Transcription:\n", user_input)
    return user_input

def create_context_prompt(user_input, conversation_history="", is_follow_up=False):
    today = date.today().strftime("%B %d, %Y")
    context_prompt = f"""
    You are a professional legal assistant helping college students understand their rights.
    Explain everything calmly, clearly, and in simple terms.
    The student does not know much about the law.
    It is currently {today}.

    {conversation_history}

    Here is what the student said:
    \"\"\"{user_input}\"\"\"

    Now respond with what they can and cannot do based on what you understood.
    If you need more information to provide a complete answer, ask ONE clear follow-up question.
    If you don't need more information, provide your complete answer without asking any questions.
    """
    return context_prompt

def handle_follow_up_question(question):
    print("\n💬 Gemini asks:\n", question)
    print("\nWould you like to answer this follow-up question? (y/n)")
    if input().lower().strip() != 'y':
        return None
    
    print("\nPlease record your answer...")
    return get_user_input()

def main():
    conversation_history = ""
    
    while True:
        try:
            # Get initial user input
            print("\nPlease record your question...")
            user_input = get_user_input()
            
            # Create prompt with conversation history
            context_prompt = create_context_prompt(user_input, conversation_history)
            
            # Get Gemini's response
            response = prompt_gemini(context_prompt)
            print("\n💬 Gemini says:\n", response)
            
            # Add to conversation history
            conversation_history += f"\nStudent: {user_input}\nAssistant: {response}\n"
            
            # Check if Gemini asked a follow-up question
            if "?" in response and "Would you like to ask a follow-up question?" not in response:
                follow_up_answer = handle_follow_up_question(response)
                if follow_up_answer:
                    # Process the follow-up answer
                    follow_up_prompt = create_context_prompt(follow_up_answer, conversation_history, is_follow_up=True)
                    follow_up_response = prompt_gemini(follow_up_prompt)
                    print("\n💬 Gemini says:\n", follow_up_response)
                    conversation_history += f"\nStudent: {follow_up_answer}\nAssistant: {follow_up_response}\n"
            
            # Ask if user wants to start a new question
            print("\nWould you like to ask a new question? (y/n)")
            if input().lower().strip() != 'y':
                print("Goodbye! Have a great day!")
                break
                
        except KeyboardInterrupt:
            print("\nGoodbye! Have a great day!")
            break
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            print("Would you like to try again? (y/n)")
            if input().lower().strip() != 'y':
                break

if __name__ == "__main__":
    main()
