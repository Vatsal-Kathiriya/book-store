export default function About() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">About BookStore</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 md:h-80">
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2076&auto=format&fit=crop" 
            alt="Bookstore interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Your Premier Destination for Books</h2>
              <p className="text-gray-200">Serving book lovers since 2010</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead">
              BookStore is committed to bringing knowledge, stories, and imagination to readers worldwide. 
              Our extensive collection spans all genres, from bestselling fiction to educational resources.
            </p>
            
            <h3>Our Story</h3>
            <p>
              Founded in 2010, BookStore began as a small corner shop with a passion for literature. 
              Today, we've grown into one of the leading online book retailers, while maintaining our commitment to 
              personal service and curated selections.
            </p>
            <p>
              Our mission is simple: connect readers with books they'll love. We believe reading 
              transforms lives, opens minds, and brings communities together.
            </p>
            
            <h3>What Sets Us Apart</h3>
            <ul>
              <li>Carefully curated selections across all genres</li>
              <li>Expert recommendations from our team of book enthusiasts</li>
              <li>Commitment to supporting independent authors and publishers</li>
              <li>Fast shipping and exceptional customer service</li>
              <li>Regular literary events, book clubs, and author spotlights</li>
            </ul>
            
            <h3>Our Team</h3>
            <p>
              Our diverse team brings together experienced booksellers, literature scholars, tech 
              enthusiasts, and customer service experts. We're united by our love of reading and 
              dedication to sharing that passion with our customers.
            </p>
            
            <h3>Community Involvement</h3>
            <p>
              BookStore is proud to support literacy programs in underserved communities. 
              Through our "Books for All" initiative, we donate a portion of every sale to 
              organizations that promote reading and provide books to those who need them most.
            </p>
            
            <h3>Contact Us</h3>
            <p>
              We'd love to hear from you! Whether you have a question about an order, need a book 
              recommendation, or want to share feedback, our team is here to help.
            </p>
            
            <p>
              <strong>Email:</strong> contact@bookstore.com<br />
              <strong>Phone:</strong> +1 (555) 123-4567<br />
              <strong>Hours:</strong> Monday to Friday, 9am - 6pm EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}